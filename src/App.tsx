import React, { useState } from "react";
import {
  Layout,
  Typography,
  Input,
  Button,
  Card,
  Space,
  message,
  ConfigProvider,
  Row,
  Col,
  Tag,
  FloatButton,
} from "antd";
import {
  RocketOutlined,
  CodeOutlined,
  BulbOutlined,
  ThunderboltFilled,
  SendOutlined,
  CheckCircleFilled, // Icon cho model
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "./App.css";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const App: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // State mới để lưu tên model
  const [usedModel, setUsedModel] = useState("");

  const handleVibeCheck = async () => {
    if (!prompt.trim()) {
      message.warning("Hãy nhập vibe của bạn trước nhé!");
      return;
    }
    setLoading(true);
    setResult("");
    setUsedModel(""); // Reset model cũ

    try {
      const response = await fetch("/.netlify/functions/vibe-check", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.result) {
        setResult(data.result);
        setUsedModel(data.model); // Lưu tên model từ server
        message.success("Vibe check thành công!");
      } else {
        message.error("Có lỗi xảy ra khi kết nối với AI.");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Work Sans', sans-serif",
          colorPrimary: "#764ba2",
          borderRadius: 12,
        },
        components: {
          Button: {
            controlHeight: 50,
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 50,
          },
          Input: {
            activeBorderColor: "#764ba2",
            hoverBorderColor: "#667eea",
            paddingBlock: 12,
          },
          Card: {
            borderRadiusLG: 20,
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "var(--bg-soft)" }}>
        <Header className="vibe-header" style={{ padding: "0 24px" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--primary-gradient)",
                padding: "8px",
                borderRadius: "12px",
                marginRight: "12px",
              }}
            >
              <ThunderboltFilled style={{ color: "white", fontSize: "20px" }} />
            </div>
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Vibe Coding <span style={{ color: "#764ba2" }}>VN</span>
            </Title>
          </div>
        </Header>

        <Content
          style={{
            padding: "0 24px",
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ... (Giữ nguyên phần Intro và Steps) ... */}
          <div style={{ margin: "80px 0 60px", textAlign: "center" }}>
            <Title
              level={1}
              style={{
                fontSize: "3.5rem",
                marginBottom: "20px",
                lineHeight: 1.1,
              }}
            >
              Code theo dòng chảy <br />
              <span className="gradient-text">Vibe & Tư duy.</span>
            </Title>
            <Paragraph
              style={{
                fontSize: "20px",
                color: "#64748b",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Đừng chỉ gõ code. Hãy truyền tải ý tưởng của bạn thành sản phẩm
              với tốc độ ánh sáng nhờ sự hỗ trợ của AI.
            </Paragraph>
          </div>

          {/* Steps Section giữ nguyên */}
          <Row gutter={[24, 24]} style={{ marginBottom: 60 }}>
            {[
              {
                title: "1. Ý Tưởng",
                desc: "Mô tả tự nhiên",
                icon: <BulbOutlined />,
                color: "#f59e0b",
              },
              {
                title: "2. AI Xử Lý",
                desc: "Groq Engine",
                icon: <RocketOutlined />,
                color: "#ec4899",
              },
              {
                title: "3. Kết Quả",
                desc: "Clean Code",
                icon: <CodeOutlined />,
                color: "#10b981",
              },
            ].map((step, index) => (
              <Col xs={24} md={8} key={index}>
                <Card className="vibe-card" bordered={false}>
                  <Space align="center">
                    <div
                      style={{
                        fontSize: "24px",
                        color: step.color,
                        background: `${step.color}15`,
                        padding: "12px",
                        borderRadius: "12px",
                        display: "flex",
                      }}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <Text
                        strong
                        style={{ fontSize: "16px", display: "block" }}
                      >
                        {step.title}
                      </Text>
                      <Text type="secondary">{step.desc}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Interactive Playground */}
          <Card
            className="vibe-card"
            bordered={false}
            style={{
              overflow: "hidden",
              marginBottom: 20,
              padding: "20px",
              border: "1px solid rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <Title level={3} style={{ marginTop: 0 }}>
                Thử nghiệm ngay
              </Title>
              <Text type="secondary">
                Nhập ý tưởng của bạn bên dưới (Ví dụ: "Viết component thẻ bài
                Pokemon")
              </Text>
            </div>

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <TextArea
                showCount
                maxLength={1000}
                style={{
                  fontSize: "16px",
                  resize: "none",
                  background: "#f8fafc",
                  border: "2px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "20px",
                }}
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Mô tả vibe của bạn ở đây..."
              />

              <Button
                type="primary"
                icon={loading ? <RocketOutlined spin /> : <SendOutlined />}
                loading={loading}
                onClick={handleVibeCheck}
                block
                size="large"
                style={{
                  background: "var(--primary-gradient)",
                  border: "none",
                  height: "60px",
                  fontSize: "18px",
                  boxShadow: "0 10px 25px -5px rgba(118, 75, 162, 0.4)",
                }}
              >
                {loading ? "Đang suy nghĩ..." : "Generate Code"}
              </Button>
            </Space>

            {result && (
              <div style={{ marginTop: 40, animation: "fadeIn 0.5s ease" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 15,
                    borderBottom: "1px solid #f0f0f0",
                    paddingBottom: 10,
                  }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    Kết quả:
                  </Title>

                  {/* HIỂN THỊ MODEL NAME TINH TẾ */}
                  {usedModel && (
                    <Tag
                      icon={<CheckCircleFilled />}
                      color="cyan"
                      style={{
                        margin: 0,
                        padding: "4px 10px",
                        fontSize: "12px",
                        borderRadius: "20px",
                        border: "none",
                        background: "rgba(5, 150, 105, 0.1)",
                        color: "#059669",
                        fontFamily: "Fira Code",
                      }}
                    >
                      {usedModel}
                    </Tag>
                  )}
                </div>

                <div className="markdown-result">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {result}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </Card>
        </Content>

        <Footer
          style={{
            textAlign: "center",
            background: "transparent",
            color: "#94a3b8",
            padding: "20px 0",
          }}
        >
          Vibe Coding VN ©{new Date().getFullYear()} <br />
          Built with <span style={{ color: "#ef4444" }}>❤</span> using React,
          Ant Design & Groq
        </Footer>
        <FloatButton.BackTop
          className="vibe-back-top"
          type="primary"
          visibilityHeight={300}
          tooltip={<div>Lên đỉnh!</div>}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default App;
