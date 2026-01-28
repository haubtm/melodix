# Hướng dẫn Deploy Melodix Backend với AWS EC2 & Docker

Tài liệu này hướng dẫn chi tiết cách thiết lập Server (EC2) và GitHub Secrets để pipeline CI/CD hoạt động.

## Phần 1: Tạo EC2 Instance

1.  Đăng nhập AWS Console -> **EC2** -> **Launch Instance**.
2.  **OS**: Ubuntu Server 22.04 LTS (x86_64).
3.  **Instance Type**: `t2.micro` (Free Tier eligible).
4.  **Key Pair**: Tạo mới (lưu file `.pem` về máy, **đừng làm mất**).
5.  **Network Settings**:
    - Allow SSH traffic from **Anywhere** (0.0.0.0/0).
    - Allow HTTP traffic from the internet.
    - Allow HTTPS traffic from the internet.
6.  Nhấn **Launch Instance**.
7.  Sau khi tạo xong, click vào Instance ID -> Chọn tab **Security** -> Click vào **Security Group**.
8.  Edit **Inbound rules** -> Add rule -> **Custom TCP** -> Port **3000** -> Source `0.0.0.0/0` (Để mở port API).

---

## Phần 2: Cài đặt môi trường trên EC2

Kết nối SSH vào EC2 (dùng CMD hoặc Terminal):

```bash
ssh -i "path/to/your-key.pem" ubuntu@<PUBLIC-IP-CUA-EC2>
```

Sau khi vào được server, chạy các lệnh sau để cài Docker:

```bash
# Update
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Setup repository
echo \
  "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Cho phép user 'ubuntu' dùng docker không cần sudo
sudo usermod -aG docker ubuntu
```

**Logout và SSH login lại** để nhận quyền Docker.

---

## Phần 3: Thêm File .env trên Server

Trên Server EC2, anh cần tạo folder và file `.env` chứa bí mật (vì ta không đưa file này lên Git):

```bash
mkdir -p ~/melodix
nano ~/melodix/.env
```

Paste nội dung file `.env` ở local của anh vào đây.
**Lưu ý**: S3 Region, DB URL phải chính xác. Với Database, nếu dùng LocalHost ở local thì trên Server phải đổi thành IP của RDS hoặc chạy thêm Container DB.
_Nếu anh chưa có RDS, em khuyên dùng bản Docker Compose full bao gồm cả DB._

Lưu file: `Ctrl + O` -> `Enter` -> `Ctrl + X`.

---

## Phần 4: Cấu hình GitHub Secrets

Vào Repository trên GitHub -> **Settings** -> **Secrets and variables** -> **Actions** -> New Repository Secret.

Thêm các key sau:

1.  `DOCKER_HUB_USERNAME`: Tài khoản Docker Hub của anh.
2.  `DOCKER_HUB_ACCESS_TOKEN`: Token (tạo trong Docker Hub -> Account Settings -> Security).
3.  `EC2_HOST`: Public IP của EC2 vừa tạo.
4.  `EC2_SSH_KEY`: Nội dung file `.pem` (Mở file .pem bằng Notepad rồi copy hết vào đây).

---

## Hoàn tất

Sau khi setup xong:

1.  Push code lên nhánh `main`.
2.  Vào tab **Actions** trên GitHub để xem quá trình build & deploy.
3.  Khi thành công, API sẽ chạy tại: `http://<EC2-IP>:3000/api/v1/...`
