# Dataset License Agreement

**Zirconoid Inc. ("Zirconoid")**  
**Effective [DATE], Version 1.0**  
**Site:** https://zirconoid.com · **Contact:** data@zirconoid.com

This Dataset License Agreement (the "**Agreement**" or "**Data License**") is the license under which Zirconoid grants Customer rights to use a Dataset purchased through zirconoid.com. It is the separate written dataset license referenced in the zirconoid.com Terms of Service. Together with the Order Confirmation and the Online Terms of Sale accepted at checkout, it forms the complete purchase contract for that Order.

**Electronic acceptance.** By checking the required box at checkout, paying, and receiving an Order Confirmation, Customer accepts this Agreement. That clickwrap acceptance is valid under applicable electronic signature law.

---

## 1. Definitions

**"Affiliates"** means any entity that directly or indirectly controls, is controlled by, or is under common control with a party, where "control" means ownership of more than 50% of voting securities or equivalent voting interest.

**"Annotations"** means labels, metadata, transcripts, bounding boxes, segmentation masks, timestamps, task tags, and similar structured information that Zirconoid provides as part of the Dataset (as distinct from raw video/audio).

**"Commercial License"** means the license SKU described in §3.2, if selected on the Order Confirmation.

**"Confidential Information"** means the Dataset (including raw video, audio, and Annotations), access credentials, pricing not published on the site, and non-public technical or business information disclosed by Zirconoid in connection with an Order. It does not include information that is public through no fault of Customer, independently developed without use of Zirconoid materials, or rightfully received from a third party without confidentiality duty.

**"Customer"** means the legal entity (or sole proprietor) named on the Order Confirmation.

**"Dataset"** means the specific pack of labeled human-captured egocentric video (raw media plus Annotations) identified by Dataset ID / SKU on the Order Confirmation, and any updates or replacements Zirconoid provides for that Order.

**"Models"** means machine learning or artificial intelligence models (including weights, checkpoints, architectures, and fine-tunes) that Customer develops, trains, fine-tunes, evaluates, or validates using the Dataset under this Agreement.

**"Model Outputs"** means inferences, predictions, embeddings, generated content, or other results produced by Models when run on inputs other than redistribution of the Dataset itself.

**"Order Confirmation"** means Zirconoid's written or electronic confirmation of a paid order, stating Dataset ID, License SKU (Train or Commercial), price, and delivery/access details.

**"Train License"** means the license SKU described in §3.1 (default self-serve), if selected on the Order Confirmation.

**"Zirconoid"** means Zirconoid Inc., a corporation organized under the laws of [State of incorporation TBD].

---

## 2. Grant condition — payment and access

2.1. Subject to Customer's payment in full for the applicable Order and compliance with this Agreement, Zirconoid grants Customer the license rights in §3 for the License SKU stated on the Order Confirmation.

2.2. Until payment clears and access is provided, Customer has **no** license. Evaluation samples, if any, are governed by a separate sample or NDA arrangement — not by this Agreement — unless the Order Confirmation says otherwise.

---

## 3. License grants

### 3.1 Train License (default self-serve)

If the Order Confirmation selects **Train License**, Zirconoid grants Customer a **non-exclusive, non-transferable, non-sublicensable** (except to Affiliates as below), worldwide, fee-bearing license to:

**(a)** use, reproduce, and internally process the Dataset solely to **develop, train, fine-tune, evaluate, and validate** machine learning / AI Models;

**(b)** create and retain Models and Model Outputs;

**(c)** **commercialize** Models and products or services that incorporate or are powered by those Models, provided the Dataset itself (and substantial extracts of the Dataset) are **not** included, redistributed, publicly hosted, resold, or sublicensed to third parties;

**(d)** permit Customer's **Affiliates** and Customer's and Affiliates' employees and contractors to exercise these rights **solely on Customer's behalf**, under confidentiality no less protective than this Agreement, with Customer remaining liable for their acts and omissions.

**Train License does not** grant rights to redistribute, resell, publicly host, or sublicense the Dataset or substantial extracts, or to build a competing dataset product by extracting, scraping, or repackaging the Dataset (see §5).

**Clarification:** Under Train, Customer **may** sell or deploy Models and commercial products/services to third parties. What Train forbids is treating the Dataset (or a substantial extract) as a data product for others.

### 3.2 Commercial License (upsell)

If the Order Confirmation selects **Commercial License**, Zirconoid grants Customer **all Train License rights in §3.1**, plus:

**(i) Express third-party commercial deployment.** Customer may deploy Models in commercial products and services sold or provided to third parties (including via API, edge devices, robots, or hosted inference), still without redistributing the Dataset itself;

**(ii) Affiliate / seat expansion.** Use by the number of Affiliates, business units, or seats stated on the Order Confirmation (if none stated, then Affiliates under common control as in §3.1(d), plus any expansion package purchased);

**(iii) Zirconoid IP / consent indemnity.** The indemnity in §10.2 applies (Train License Orders do **not** include §10.2 unless the Order Confirmation expressly adds it).

Commercial does **not** add Dataset redistribution rights. If Customer needs to share raw Dataset files with a third party (for example, a joint research partner holding its own copy), contact data@zirconoid.com for a paper addendum — that is outside self-serve clickwrap.

### 3.3 No other licenses

All rights not expressly granted are reserved by Zirconoid. This Agreement is a **license**, not a sale of the Dataset or of any intellectual property in the Dataset.

---

## 4. Ownership

4.1. **Zirconoid retains** all right, title, and interest in and to the Dataset, including raw video, audio, and Annotations Zirconoid provides, and all related intellectual property. No title passes to Customer.

4.2. **Customer retains** all right, title, and interest in and to Models and Model Outputs that Customer creates under an authorized license, subject to Zirconoid's underlying rights in the Dataset and to the restrictions in this Agreement (including §8 Termination effects).

4.3. **Feedback.** If Customer provides suggestions or feedback about the Dataset or Zirconoid's services, Customer grants Zirconoid a perpetual, irrevocable, royalty-free, worldwide license to use and incorporate that feedback without restriction or attribution obligation.

---

## 5. Consent, likeness, and privacy

5.1. **Zirconoid representation.** Zirconoid represents that it has obtained rights and consents from participants (and, where applicable, releases covering incidental bystanders to the extent reasonably obtainable) that are **reasonably necessary** for the licensed uses described in §3. [Participant consent documentation must exist before public `/buy` — see OPEN_QUESTIONS.]

5.2. **What the Dataset may contain.** The Dataset may include images, video, and audio of people performing tasks in egocentric (first-person) capture settings.

5.3. **What Customer does *not* get.**

- No right of publicity or endorsement  
- No right to identify, contact, locate, or solicit individuals depicted  
- No right to use likenesses outside the model-training / model-deployment context permitted in §3  
- No biometric identity template rights for identifying specific people  

5.4. **Hard prohibitions related to people in the Dataset.** Customer must not:

- Attempt to **re-identify** participants or bystanders  
- Build or operate **biometric identity** systems aimed at recognizing specific individuals from the Dataset  
- Use the Dataset for **surveillance targeting specific people**  
- **Publish recognizable stills or clips** of subjects (except internal secure engineering use under confidentiality)  
- Reverse engineer identity, name, contact details, or sensitive attributes of individuals from the Dataset  

---

## 6. Prohibited uses

Customer shall not, and shall not permit others to:

- Redistribute, sell, rent, lease, sublicense, publish, or publicly host the Dataset or **substantial extracts** of it  
- Use the Dataset to create a **competing dataset product** (including by extracting, filtering, relabeling, or repackaging Zirconoid data for license or sale to others)  
- Use the Dataset to train models whose **primary purpose** is unlawful activity  
- Use the Dataset for **re-identification**, biometric identity of specific persons, or targeted personal surveillance (see §5.4)  
- Attempt to bypass access controls, scrape Zirconoid systems beyond authorized delivery, or share credentials outside permitted users  
- Remove or alter proprietary notices on Dataset materials  
- Use the Dataset in violation of export controls, sanctions, or anti-corruption laws (§12)  
- **[NEEJ DECISION]** Use for **weapons development, military targeting, or lethal autonomous systems** — counsel default: **hard ban** unless Zirconoid issues a written waiver for a specific Customer. See OPEN_QUESTIONS.  
- Include or train on content involving **minors** — Zirconoid's capture programs are intended **adults only**; if Customer discovers apparent minor content, stop use of that material and notify data@zirconoid.com immediately  

---

## 7. Confidentiality

7.1. Customer will protect Confidential Information with at least reasonable care and no less care than it uses for its own similar information.

7.2. Customer may disclose Confidential Information only to personnel and contractors with a need to know for licensed use, under confidentiality obligations, or if required by law (with prior notice to Zirconoid where legally permitted).

7.3. Dataset confidentiality continues for so long as the Dataset remains non-public, and for **three (3) years** after termination as to other Confidential Information, except trade secrets for so long as they remain trade secrets.

---

## 8. Term, termination, and survival

8.1. **Effective date.** This Agreement is effective for an Order on the later of (a) payment clearing and (b) Zirconoid providing access for that Order.

8.2. **Dataset access.** Customer's right to access and download the Dataset continues until terminated under this §8. Zirconoid may set a download window on the Order Confirmation; after that window, re-delivery may require a support request and is not guaranteed without a new Order.

8.3. **Models — vested use.** Subject to §8.6, Models trained during authorized access under a valid license may continue to be used by Customer on a **perpetual** basis after Dataset access ends (including after ordinary end of a download window), provided Customer remains in compliance and does not retain unauthorized copies of the Dataset beyond what §8.5 allows during wind-down.

8.4. **Termination for cause.** Either party may terminate this Agreement (as to the affected Order) if the other party materially breaches and fails to cure within **thirty (30) days** after written notice. No cure period applies to breaches that are incurable or involve illegal use, willful misuse of the Dataset, or violation of §5.4 or §6 prohibited uses involving people, weapons (if banned), export/sanctions, or competing dataset products.

8.5. **Effect of termination.** Upon termination or expiry of Dataset access rights, Customer must: (a) cease new access to and use of the Dataset; (b) destroy or securely delete copies of the Dataset in its possession or control within **thirty (30) days** (except copies retained solely as required by law or automated backup systems that are not actively used, which remain subject to confidentiality); and (c) certify destruction in writing within ten (10) days after Zirconoid's request.

8.6. **Models after prohibited-use breach.** [NEEJ DECISION — OPEN QUESTION.] **Counsel default:** If termination is for Customer's breach of §5.4 or §6 (prohibited uses), Customer must **not further commercialize** Models to the extent they were trained using the Dataset in violation of this Agreement, and must cease such commercial use within thirty (30) days. Models trained **in compliance** before a different (non-prohibited-use) breach may continue under §8.3. This is a policy choice — confirm before go-live.

8.7. **Survival.** Sections 1, 4, 5.3–5.4, 6, 7, 8.5–8.7, 9 (as to disclaimer), 10–15 survive termination.

---

## 9. Warranties and disclaimer

9.1. **Limited warranties by Zirconoid.** Zirconoid warrants that: (a) it has the right to grant the licenses in §3; (b) the Dataset, as delivered for the licensed uses, is consistent with participant agreements Zirconoid has in place for those uses; and (c) to Zirconoid's knowledge, the Dataset as delivered is free of malware intentionally introduced by Zirconoid.

9.2. **Disclaimer.** EXCEPT FOR §9.1, THE DATASET IS PROVIDED **"AS IS."** ZIRCONOID DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, EXCEPT TO THE EXTENT §10.2 (Commercial License indemnity) applies. Zirconoid does not warrant that Models trained on the Dataset will achieve any accuracy, safety, or performance level.

9.3. **Customer warranty.** Customer warrants that information provided at checkout is accurate and that it will use the Dataset only as licensed.

---

## 10. Indemnity

### 10.1 Customer indemnity (all SKUs)

Customer will defend, indemnify, and hold harmless Zirconoid and its officers, directors, employees, and agents from and against third-party claims, damages, losses, and reasonable legal fees arising out of: (a) Customer's misuse of the Dataset or use outside this Agreement; (b) prohibited uses under §5.4 or §6; (c) Customer's Models or Model Outputs (including products and services that use them); or (d) Customer's breach of this Agreement.

### 10.2 Zirconoid IP / consent indemnity (Commercial License only)

If the Order is a **Commercial License** Order (or Train Order where the Order Confirmation expressly adds this §10.2), Zirconoid will defend and indemnify Customer against third-party claims that the Dataset **as delivered by Zirconoid** (i) infringes a third party's copyright, or (ii) violates participant consent rights for the licensed uses in §3, and will pay resulting damages and costs finally awarded (or settled with Zirconoid's consent).

**Exclusions.** Zirconoid has no obligation under this §10.2 to the extent the claim arises from: combination of the Dataset with other data or software not provided by Zirconoid; modification of the Dataset by Customer; use outside the license; Customer's failure to comply with §5.4 or §6; or content Customer adds.

**Remedy.** If a covered claim arises, Zirconoid may (at its option): procure continued rights; replace or modify the Dataset; or terminate the affected Order and refund fees paid for that Order in the prior twelve (12) months, and Customer will cease use of the affected Dataset materials.

### 10.3 Procedure

The indemnified party must give prompt notice, reasonable cooperation, and sole control of defense/settlement to the indemnifying party (settlements requiring admission of fault or non-monetary obligations by the indemnified party need that party's consent, not unreasonably withheld).

---

## 11. Liability cap

11.1. **Cap.** EXCEPT FOR §11.3, EACH PARTY'S TOTAL LIABILITY UNDER THIS AGREEMENT FOR AN ORDER WILL NOT EXCEED THE FEES PAID BY CUSTOMER TO ZIRCONOID FOR THAT ORDER IN THE **TWELVE (12) MONTHS** BEFORE THE CLAIM (OR **USD 100** IF THE ORDER WAS FREE OR EVALUATION-ONLY).

11.2. **Consequential damages.** EXCEPT FOR §11.3, NEITHER PARTY IS LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, OR LOST PROFITS, REVENUE, OR DATA, EVEN IF ADVISED OF THE POSSIBILITY.

11.3. **Carve-outs.** §§11.1–11.2 do not limit liability for: (a) willful misconduct or fraud; (b) Customer's unpaid fees; (c) breach of confidentiality (§7); (d) Customer's indemnity obligations (§10.1); or (e) infringement or misappropriation of the other party's intellectual property to the extent not otherwise limited by law. Zirconoid's indemnity under §10.2 remains subject to the cap in §11.1 unless a court requires otherwise.

---

## 12. Export control, sanctions, and anti-corruption

12.1. Customer represents it is not located in, organized under the laws of, or ordinarily resident in a comprehensively sanctioned jurisdiction, and is not a denied or restricted party under U.S. or other applicable sanctions or export laws.

12.2. Customer will not export, re-export, or transfer the Dataset or Models in violation of applicable export-control or sanctions laws.

12.3. Customer will comply with applicable anti-bribery and anti-corruption laws (including the U.S. Foreign Corrupt Practices Act where applicable).

12.4. Zirconoid may suspend or terminate access if continued performance would violate sanctions or export law. [Geographic ban list — see OPEN_QUESTIONS.]

---

## 13. Audit (light-touch)

If Zirconoid has a **reasonable suspicion** of material breach (for example, Dataset redistribution or competing dataset product use), Zirconoid may request, on at least fifteen (15) days' notice, a written certification of compliance and reasonably scoped records sufficient to verify Dataset handling. Audits are limited to once per twelve (12) months unless a prior audit found material non-compliance. On-site audits require mutual agreement unless required by a regulator.

---

## 14. Assignment

Customer may not assign this Agreement without Zirconoid's prior written consent, except to an Affiliate or in connection with a merger, acquisition, or sale of substantially all assets, with notice to Zirconoid and provided the assignee is not a direct competitor of Zirconoid in egocentric / physical-AI training data. Zirconoid may assign freely. Any unauthorized assignment is void.

---

## 15. Governing law; venue; miscellaneous

15.1. **Governing law.** Delaware law, USA, without regard to conflict-of-law principles (matching zirconoid.com Terms of Service).

15.2. **Venue.** Exclusive jurisdiction and venue in state or federal courts located in Delaware; each party consents to personal jurisdiction there. [NEEJ DECISION — arbitration option; see OPEN_QUESTIONS.]

15.3. **Entire agreement.** Order Confirmation + this Data License + Online Terms of Sale + (as to site use only) website Terms/Privacy are the entire agreement for the Order. Precedence: **Order Confirmation > Data License > Terms of Sale > website Terms.**

15.4. **Amendments.** Must be in writing (including accepted clickwrap of a new Version for new Orders). Prior paid Orders keep the Version accepted at checkout.

15.5. **Severability; waiver; notices.** If a provision is unenforceable, the rest remains. Failure to enforce is not a waiver. Notices to Zirconoid: data@zirconoid.com and [Notice address TBD]. Notices to Customer: email on the Order Confirmation.

15.6. **Independent contractors.** Nothing creates partnership, joint venture, or employment.

15.7. **Government users.** If Customer is a U.S. government entity, the Dataset is "commercial computer software" / commercial data licensed only with the rights in this Agreement.

---

**Zirconoid Inc.**  
data@zirconoid.com · https://zirconoid.com  
Effective [DATE], Version 1.0
