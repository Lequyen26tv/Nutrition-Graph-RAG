import re
import unicodedata


def normalize_text(text: str) -> str:
    """
    Chuẩn hóa text:
    - bỏ khoảng trắng đầu/cuối
    - chuyển về chữ thường
    - gộp nhiều khoảng trắng thành 1
    """
    if not text:
        return ""

    text = text.strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def remove_accents(text: str) -> str:
    """
    Bỏ dấu tiếng Việt để phục vụ match mềm.
    """
    if not text:
        return ""

    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "D")
    return text


def normalize_for_matching(text: str) -> str:
    """
    Chuẩn hóa dùng cho matching:
    - normalize text
    - bỏ dấu
    - bỏ ký tự đặc biệt dư thừa
    """
    text = normalize_text(text)
    text = remove_accents(text)
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text