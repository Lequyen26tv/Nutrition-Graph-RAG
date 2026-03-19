from nlp.text_normalizer import normalize_for_matching

# ---------------------------
# FOOD SYNONYMS
# key phải là dạng normalize_for_matching(...)
# value là tên chuẩn trong DB
# ---------------------------
RAW_FOOD_SYNONYMS = {
    "pho bo": "Phở bò",
    "pho ga": "Phở gà",
    "bun bo hue": "Bún bò Huế",
    "bun rieu": "Bún riêu",
    "bun cha": "Bún chả",
    "bun thit nuong": "Bún thịt nướng",
    "bun mam": "Bún mắm",
    "bun ca": "Bún cá",
    "bun moc": "Bún mọc",
    "bun thang": "Bún thang",
    "hu tieu nam vang": "Hủ tiếu Nam Vang",
    "hu tieu go": "Hủ tiếu gõ",
    "mi quang": "Mì Quảng",
    "banh canh cua": "Bánh canh cua",
    "banh canh gio heo": "Bánh canh giò heo",
    "banh canh ca loc": "Bánh canh cá lóc",
    "bun suon": "Bún sườn",
    "bun ga": "Bún gà",
    "bun vit": "Bún vịt",
    "mien ga": "Miến gà",
    "com tam": "Cơm tấm",
    "com ga hai nam": "Cơm gà Hải Nam",
    "com ga xoi mo": "Cơm gà xối mỡ",
    "com chien duong chau": "Cơm chiên dương châu",
    "com chien hai san": "Cơm chiên hải sản",
    "com chien ca man": "Cơm chiên cá mặn",
    "com suon nuong": "Cơm sườn nướng",
    "com suon bi cha": "Cơm sườn bì chả",
    "com rang trung": "Cơm rang trứng",
    "com rang thap cam": "Cơm rang thập cẩm",
    "banh mi thit": "Bánh mì thịt",
    "banh mi trung": "Bánh mì trứng",
    "banh mi pate": "Bánh mì pate",
    "banh mi heo quay": "Bánh mì heo quay",
    "banh mi xiu mai": "Bánh mì xíu mại",
    "banh mi bo": "Bánh mì bò",
    "banh mi ga": "Bánh mì gà",
    "banh mi ca": "Bánh mì cá",
    "banh mi cha": "Bánh mì chả",
    "goi cuon": "Gỏi cuốn",
    "cha gio": "Chả giò",
    "banh xeo": "Bánh xèo",
    "banh khot": "Bánh khọt",
    "banh beo": "Bánh bèo",
    "banh nam": "Bánh nậm",
    "banh bot loc": "Bánh bột lọc",
    "banh uot": "Bánh ướt",
    "banh cuon": "Bánh cuốn",
    "banh duc": "Bánh đúc",
    "canh chua ca": "Canh chua cá",
    "canh kho qua nhoi thit": "Canh khổ qua nhồi thịt",
    "canh bi do": "Canh bí đỏ",
    "canh rau ngot": "Canh rau ngót",
    "canh cai xanh": "Canh cải xanh",
    "canh chua tom": "Canh chua tôm",
    "canh cua rau day": "Canh cua rau đay",
    "canh ca loc": "Canh cá lóc",
    "canh bau nau tom": "Canh bầu nấu tôm",
    "canh rong bien": "Canh rong biển",
    "thit kho tau": "Thịt kho tàu",
    "ca kho to": "Cá kho tộ",
    "ca kho rieng": "Cá kho riềng",
    "ca chien": "Cá chiên",
    "ga kho gung": "Gà kho gừng",
    "ga chien nuoc mam": "Gà chiên nước mắm",
    "ga nuong": "Gà nướng",
    "suon nuong": "Sườn nướng",
    "thit rang chay canh": "Thịt rang cháy cạnh",
    "thit luoc": "Thịt luộc",
    "rau muong xao toi": "Rau muống xào tỏi",
    "cai thia xao": "Cải thìa xào",
    "bap cai xao": "Bắp cải xào",
    "rau lang luoc": "Rau lang luộc",
    "rau muong luoc": "Rau muống luộc",
    "dau hu chien": "Đậu hũ chiên",
    "dau hu sot ca chua": "Đậu hũ sốt cà chua",
    "dau hu kho": "Đậu hũ kho",
    "cha dau": "Chả đậu",
    "canh dau hu": "Canh đậu hũ",
    "che dau xanh": "Chè đậu xanh",
    "che dau den": "Chè đậu đen",
    "che ba mau": "Chè ba màu",
    "che bap": "Chè bắp",
    "che troi nuoc": "Chè trôi nước",
    "banh flan": "Bánh flan",
    "chuoi chien": "Chuối chiên",
    "banh chuoi": "Bánh chuối",
    "xoi gac": "Xôi gấc",
    "xoi dau xanh": "Xôi đậu xanh",
    "xoi man": "Xôi mặn",
    "xoi la dua": "Xôi lá dứa",
    "xoi bap": "Xôi bắp",
    "xoi vo": "Xôi vò",
    "xoi dau den": "Xôi đậu đen",
    "xoi dau phong": "Xôi đậu phộng",
    "xoi ga": "Xôi gà",
    "xoi thit": "Xôi thịt",
    "xoi cha": "Xôi chả",
}

# ---------------------------
# DISEASE SYNONYMS
# ---------------------------
RAW_DISEASE_SYNONYMS = {
    "cao huyet ap": "Tăng huyết áp",
    "tang huyet ap": "Tăng huyết áp",
    "huyet ap cao": "Tăng huyết áp",

    "gut": "Bệnh gút đơn thuần",
    "gout": "Bệnh gút đơn thuần",
    "benh gut": "Bệnh gút đơn thuần",
    "benh gout": "Bệnh gút đơn thuần",

    "tieu duong": "Đái tháo đường đơn thuần",
    "dai thao duong": "Đái tháo đường đơn thuần",
    "duong huyet cao": "Đái tháo đường đơn thuần",

    "roi loan lipid": "Rối loạn lipid máu",
    "roi loan lipid mau": "Rối loạn lipid máu",
    "mo mau cao": "Rối loạn lipid máu",
}

# ---------------------------
# INGREDIENT SYNONYMS
# ---------------------------
RAW_INGREDIENT_SYNONYMS = {
    "thit bo": "Thịt bò",
    "khoai tay lat chien": "Khoai tây lát chiên",
    "khoai tay chien": "Khoai tây lát chiên",
    "rau muong": "Rau muống",
    "ca chua": "Cà chua",
}


def _build_synonym_map(raw_map: dict[str, str]) -> dict[str, str]:
    normalized_map = {}
    for key, value in raw_map.items():
        normalized_key = normalize_for_matching(key)
        normalized_map[normalized_key] = value
    return normalized_map


FOOD_SYNONYMS = _build_synonym_map(RAW_FOOD_SYNONYMS)
DISEASE_SYNONYMS = _build_synonym_map(RAW_DISEASE_SYNONYMS)
INGREDIENT_SYNONYMS = _build_synonym_map(RAW_INGREDIENT_SYNONYMS)