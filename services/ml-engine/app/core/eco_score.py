from app.schemas import EcoScoreRequest, EcoScoreResponse


GOOD_MATERIALS = {"bamboo", "cotton", "recycled", "organic", "wood", "paper", "kain", "bambu", "organik", "organic_cotton", "linen", "hemp"}
GOOD_WORDS = {"reusable", "organik", "ramah lingkungan", "daur ulang", "bisa digunakan berulang"}


def calculate_eco_score(payload: EcoScoreRequest) -> EcoScoreResponse:
    score = 50.0
    reasons: list[str] = ["Base score 50"]

    material = (payload.material_type or "").lower()
    description = (payload.description or "").lower()

    if payload.recyclable is True:
        score += 20
        reasons.append("Produk dapat didaur ulang")

    if material in GOOD_MATERIALS:
        score += 10
        reasons.append("Material termasuk kategori ramah lingkungan")

    if payload.carbon_footprint is not None and payload.carbon_footprint <= 2:
        score += 10
        reasons.append("Carbon footprint rendah")

    if any(word in description for word in GOOD_WORDS):
        score += 5
        reasons.append("Deskripsi menunjukkan penggunaan berkelanjutan")

    if material == "plastic":
        score -= 10
        reasons.append("Material plastik menurunkan skor")

    if payload.carbon_footprint is not None and payload.carbon_footprint >= 10:
        score -= 10
        reasons.append("Carbon footprint tinggi")

    score = max(0, min(100, score))
    return EcoScoreResponse(eco_score=score, label=_label(score), reasons=reasons)


def _label(score: float) -> str:
    if score >= 80:
        return "Excellent Eco"
    if score >= 65:
        return "Eco Friendly"
    if score >= 50:
        return "Moderate"
    return "Low Eco"
