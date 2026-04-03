# 🥗 NGR - Patient Nutrition Knowledge Graph System

> 🔬 Hệ thống đồ thị tri thức hỗ trợ phân tích dinh dưỡng theo bệnh lý  
> ⚡ Kết hợp Knowledge Graph (Neo4j), NLP tiếng Việt và Reasoning Engine

---

## 🚀 Tổng quan

**NGR (Nutrition Graph System)** là một hệ thống hỗ trợ phân tích và tư vấn dinh dưỡng thông minh, giúp người dùng đưa ra quyết định ăn uống phù hợp với tình trạng sức khỏe.

### 🎯 Mục tiêu
- Hỗ trợ **phân tích dinh dưỡng món ăn**
- Đánh giá mức độ **phù hợp theo bệnh lý**
- Cung cấp **cảnh báo sức khỏe**
- Đề xuất **món ăn thay thế tối ưu**
- Tính toán dinh dưỡng từ **danh sách nguyên liệu**

👉 Hệ thống sử dụng **Knowledge Graph (Neo4j)** để mô hình hóa dữ liệu dinh dưỡng và **NLP tiếng Việt** để hiểu yêu cầu người dùng dưới dạng ngôn ngữ tự nhiên.

---

## 🧠 Kiến trúc hệ thống

Hệ thống được thiết kế theo hướng modular, bao gồm 4 thành phần chính:

### 🔹 1. NLP tiếng Việt
- Chuẩn hóa văn bản đầu vào
- Nhận diện thực thể (Entity Recognition):
  - Món ăn
  - Nguyên liệu
  - Bệnh lý
- Phân loại ý định (Intent Classification)

---

### 🔹 2. Knowledge Graph (Neo4j)

#### 📌 Các thực thể chính:
- `Food`
- `Ingredient`
- `Disease`

#### 🔗 Quan hệ:
- `Food` → `CONTAINS` → `Ingredient`
- `Ingredient` → `AFFECTS` → `Disease`
- `Food` → `SUITABLE_FOR` → `Disease`

👉 Cho phép truy vấn linh hoạt và suy luận mối quan hệ giữa dinh dưỡng và bệnh lý.

---

### 🔹 3. Reasoning Engine

Đóng vai trò xử lý logic và suy luận:

- Tính toán giá trị dinh dưỡng tổng hợp
- So sánh với ngưỡng khuyến nghị theo bệnh
- Sinh cảnh báo sức khỏe
- Tính toán **Health Score** cho món ăn

---

### 🔹 4. Frontend (User Interface)

- Giao diện trực quan, dễ sử dụng
- Hỗ trợ nhập liệu nhanh
- Hiển thị:
  - Biểu đồ dinh dưỡng
  - Kết quả phân tích
  - Gợi ý món ăn

---

## 🏥 Phạm vi bệnh lý (Scope)

Hệ thống tập trung vào một số nhóm bệnh phổ biến:

### 🩸 Đái tháo đường
- Mã bệnh: `DD01-X → DD09-X`
- Kiểm soát:
  - Carbohydrate
  - Năng lượng (Calories)

---

### 🦴 Gút
- Mã bệnh: `GU01-X → GU03-X`
- Kiểm soát:
  - Hàm lượng Purin

---

### ❤️ Tim mạch & Huyết áp
- Mã bệnh: `TM01-X → TM08-X`
- Kiểm soát:
  - Natri
  - Cholesterol

---

### 🦠 Nhiễm khuẩn
- Mã bệnh: `NK01-X → NK03-X`
- Tối ưu:
  - Năng lượng
  - Protein

---

### ⚠️ Giới hạn hệ thống

> Hệ thống chỉ hỗ trợ các bệnh nằm trong dataset hiện có.  
> Nếu người dùng nhập bệnh ngoài phạm vi → hệ thống sẽ thông báo rõ ràng.

---

## 🎯 Tính năng chính

| Tính năng | Mô tả |
|----------|------|
| 🔍 Hỏi đáp tự nhiên | Nhập câu hỏi bằng tiếng Việt |
| 🍜 Phân tích món ăn | Tính toán dinh dưỡng chi tiết |
| ❤️ Đánh giá theo bệnh | So sánh & đưa ra cảnh báo |
| 🥬 Tra cứu nguyên liệu | Xem thông tin dinh dưỡng |
| ⚖️ Tính từ nguyên liệu | Tổng hợp dinh dưỡng món ăn |
| 🔄 Gợi ý món thay thế | Đề xuất phương án tốt hơn |
| 📅 Thực đơn 1 ngày | Gợi ý chế độ ăn phù hợp |

---

## 🛠 Công nghệ sử dụng

### Backend
- **FastAPI**
- **Python**

### Frontend
- **ReactJS**
- **TailwindCSS**

### Database
- **Neo4j (Graph Database)**

### NLP tiếng Việt
- **Underthesea**
- Text Normalization
- Synonym Mapping
- Intent Classification

---

## 💡 Điểm nổi bật

- 🔗 Ứng dụng **Knowledge Graph** trong bài toán dinh dưỡng
- 🧠 Kết hợp **NLP + Reasoning** để xử lý ngôn ngữ tự nhiên
- ⚕️ Hướng đến **healthcare application thực tế**
- 🚀 Có khả năng mở rộng thành:
  - Ứng dụng tư vấn dinh dưỡng
  - API cho hệ thống y tế
  - Chatbot sức khỏe

---

## 📌 Định hướng phát triển

- Tích hợp **LLM (AI Chat Assistant)**
- Cá nhân hóa theo hồ sơ người dùng
- Mở rộng dataset bệnh và dinh dưỡng
- Xây dựng hệ thống recommendation nâng cao

---
-Link demo: https://drive.google.com/file/d/1qvNrLzjDs8JYbHuJAE9L4WYeaatcvS51/view?usp=sharing
- Link web: http://103.82.26.217/
- Connect URL / Database: neo4j://103.82.26.217:7687
- Username: neo4j
- Password: dinhduong123
