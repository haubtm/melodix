import MainLayout from "@/components/layout/MainLayout";

interface ProtectedPageShellProps {
  title: string;
  description: string;
}

export function ProtectedPageShell({
  title,
  description,
}: ProtectedPageShellProps) {
  return (
    <MainLayout>
      <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 48 }}>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800 }}>{title}</h1>
        <p
          style={{
            marginTop: 12,
            color: "rgba(255,255,255,0.68)",
            fontSize: 16,
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      </div>
    </MainLayout>
  );
}
