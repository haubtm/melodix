# Hướng dẫn Deploy Melodix Backend với AWS EC2 & Docker

Tài liệu này hướng dẫn chi tiết cách thiết lập Server (EC2), Docker, Domain, SSL và GitHub Secrets để pipeline CI/CD hoạt động.

## Phần 1: Tạo EC2 Instance

1.  Đăng nhập AWS Console -> **EC2** -> **Launch Instance**.
2.  **OS**: Ubuntu Server 22.04 LTS (x86_64).
3.  **Instance Type**: `t2.micro` (Free Tier eligible).
4.  **Key Pair**: Tạo mới (lưu file `.pem` về máy, **đừng làm mất**).
5.  **Network Settings**:
    - Allow SSH traffic from **Anywhere** (0.0.0.0/0).
    - Allow HTTP traffic from the internet (Port 80/443).
    - Allow HTTPS traffic from the internet.
6.  Nhấn **Launch Instance**.
7.  Sau khi tạo xong, click vào Instance ID -> Chọn tab **Security** -> Click vào **Security Group**.
8.  Edit **Inbound rules** -> Add rules:
    - **SSH**: Port 22
    - **HTTP**: Port 80
    - **HTTPS**: Port 443
    - **Custom TCP**: Port 3000 (Cho Backend Container - Optional nếu dùng Nginx).

---

## Phần 2: Cài đặt môi trường trên EC2

Kết nối SSH vào EC2:

```bash
ssh -i "path/to/your-key.pem" ubuntu@<PUBLIC-IP-CUA-EC2>
```

### 1. Cài đặt Docker

```bash
# Add Docker's official GPG key & Repository (Theo trang chủ Docker)
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Cấp quyền cho user
sudo usermod -aG docker ubuntu
# Logout rồi Login lại để nhận quyền
```

### 2. Cài đặt Nginx & Certbot (SSL)

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

## Phần 3: Cấu hình Project trên Server

### 1. Tạo thư mục và file .env

```bash
mkdir -p ~/melodix
nano ~/melodix/.env
```

Paste nội dung file `.env` (Production) vào đây.
**Lưu ý**:

- `DATABASE_URL="mysql://root:PASS@melodix-db:3306/melodix"` (Dùng tên service `melodix-db`).

### 2. Cấu hình Nginx (Reverse Proxy)

Tạo file config:

```bash
sudo nano /etc/nginx/sites-available/melodix
```

Nội dung:

```nginx
server {
    server_name api.melodix.lebahau.site; # Thay bằng tên miền của bạn

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt và khởi động lại:

```bash
sudo ln -s /etc/nginx/sites-available/melodix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Cài SSL (HTTPS)

```bash
sudo certbot --nginx -d api.melodix.lebahau.site
```

(Làm theo hướng dẫn trên màn hình).

---

## Phần 4: Cấu hình GitHub Secrets

Vào Repository -> Settings -> Secrets and variables -> Actions. Thêm:

1.  `DOCKER_HUB_USERNAME`
2.  `DOCKER_HUB_ACCESS_TOKEN`
3.  `EC2_HOST` (IP Public)
4.  `EC2_SSH_KEY` (Nội dung file .pem)

---

## Hoàn tất

Sau khi push code lên nhánh `main`, CI/CD sẽ tự động:

1.  Build Docker Image.
2.  Push lên Docker Hub.
3.  SSH vào EC2, pull image mới và restart container.
4.  Website truy cập tại: `https://api.melodix.lebahau.site/docs`
