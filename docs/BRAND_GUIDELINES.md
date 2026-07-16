# Ametta Crystals — Brand Guidelines

## 1. Brand Identity

**Brand Name**

The official brand name is: **Ametta Crystals**

Do not create new references to: `Crystal Shop`

## 2. Brand Mission

Ametta Crystals is a premium ecommerce brand focused on crystals, minerals and
spiritual wellbeing products.

The brand should feel:

- Elegant
- Calm
- Premium
- Trustworthy
- Modern
- Minimal
- Warm

The goal is to create a shopping experience that feels refined, peaceful and
intentional — not generic or overloaded.

## 3. Brand Positioning

Ametta Crystals is **not**:

- A generic crystal shop
- A fantasy/magic themed website
- A cheap ecommerce template
- A marketplace
- A dropshipping-looking site

Ametta Crystals **is**:

- A curated crystal and wellbeing brand
- A premium ecommerce experience
- A calm and elegant digital store
- A brand with visual consistency and trust

## 4. Target Audience

The target audience includes people interested in:

- Crystals
- Minerals
- Mindfulness
- Spiritual wellbeing
- Home energy
- Meditation
- Decorative natural stones
- Premium gift items

The experience should feel accessible, but never cheap or overly mystical.

## 5. Tone of Voice

**Default Language**

The default language of the application is: **Portuguese (Portugal)**

**Tone**

The tone should be:

- Natural
- Warm
- Professional
- Clear
- Calm
- Trustworthy

Use elegant and simple language.

Good examples:

```
Descubra cristais selecionados com intenção e cuidado.
Peças naturais para criar equilíbrio, beleza e presença no seu espaço.
Explore a nossa coleção de cristais cuidadosamente escolhidos.
```

Avoid aggressive ecommerce copy such as:

```
Compre já antes que esgote!!!
Oferta imperdível!!!
O cristal que vai mudar a sua vida!!!
```

Avoid absolute spiritual promises. Do not claim that crystals cure, heal,
treat or guarantee specific physical, emotional or medical outcomes.

## 6. Visual Direction

Premium + Calm + Crystal-inspired + Modern.

## 7. Color Palette

**Primary Color — Amethyst Purple**

Suggested use:

- Main buttons
- Active states
- Logo accent
- Important highlights

Suggested values: `#6D4AFF`, `#7C5CFF`, `#6B46C1`

**Secondary Color — Soft Lavender**

Suggested use:

- Background accents
- Cards
- Decorative sections
- Subtle UI details

Suggested values: `#B8A2E3`, `#EDE7F6`, `#F3EEFF`

**Accent Color — Soft Gold**

Suggested use:

- Premium highlights
- Small badges
- Special labels
- Decorative accents

Suggested values: `#C9A227`, `#D6B75A`, `#B6932E`

**Neutral Colors**

| Role            | Value     |
|-----------------|-----------|
| White           | `#FFFFFF` |
| Light Background| `#FAF9F7` |
| Soft Border     | `#E8E2DC` |
| Text Primary    | `#1F1B2D` |
| Text Secondary  | `#6B6475` |

## 8. UI Style Rules

**General Style**

The interface should use:

- White or very light backgrounds
- Rounded corners
- Soft shadows
- Good spacing
- Clean typography
- Minimal decoration
- Elegant product imagery

Avoid:

- Harsh gradients
- Too many colors
- Heavy shadows
- Cluttered layouts
- Random icons
- Inconsistent button styles

**Buttons**

Buttons should be:

- Rounded
- Clear
- Elegant
- Consistent

Primary buttons should use the amethyst/purple theme.

Good labels:

```
Explorar Coleção
Ver Produto
Adicionar ao Carrinho
Guardar Alterações
Criar Produto
```

Avoid:

```
Click here
Buy now!!!
Submit
```

**Cards**

Product cards should:

- Prioritize product image
- Use consistent image ratios
- Have clean spacing
- Display price clearly
- Use subtle hover effects
- Avoid visual noise

Admin cards should:

- Be functional
- Use clear labels
- Avoid excessive decoration
- Preserve readability

**Forms**

Forms should be:

- Clean
- Easy to scan
- Portuguese
- Consistent across admin pages

Product forms should reuse the existing `ProductForm` component whenever
possible. Validation messages should be clear and user-friendly.

## 9. Logo Direction

The logo direction should be: minimal crystal symbol + "Ametta Crystals"
wordmark.

The logo should feel:

- Premium
- Minimal
- Elegant
- Calm
- Crystal-inspired

Avoid:

- Witchcraft symbols
- Fantasy icons
- Generic magic wands
- Overly detailed illustrations
- Clipart-style crystals

The logo/component should be reusable in:

- Navbar
- Admin sidebar
- Account pages
- Future emails
- Future invoices or order confirmations

Preferred component name: `BrandLogo`

## 10. Imagery

Product imagery should be:

- Clean
- High quality
- Consistent crop
- Preferably square or near-square
- Bright enough for ecommerce
- Not overly dark

Use:

- Supabase Storage for current product images
- `ProductImage` table for storing image URLs

Do not store product image URLs directly in the `Product` table. All product
images must use the existing `ProductImage` model.

## 11. Storefront Rules

The storefront should feel like a polished ecommerce website.

Important pages:

- Homepage
- Product listing
- Product detail
- Cart
- Account
- Future checkout

The storefront should prioritize:

- Product discovery
- Trust
- Visual appeal
- Clear calls to action
- Smooth shopping experience

## 12. Admin Rules

The admin area should remain visually consistent with the brand but more
functional and compact.

Admin pages live under: `/admin`

The admin should use:

- Existing `AdminSidebar`
- Existing admin layout
- Existing tRPC admin procedures
- Portuguese labels
- Clear tables and actions

Admin should not introduce a completely different visual style.

Admin actions should be clear:

```
Editar
Guardar
Cancelar
Ativar
Desativar
Ver encomenda
Atualizar estado
```

## 13. Content Rules

All new copy should follow these principles:

- Portuguese (Portugal)
- Clear and professional
- Warm but not exaggerated
- Premium but not pretentious
- Spiritual but not unrealistic
- Ecommerce-focused but not aggressive

Avoid medical, therapeutic or guaranteed benefit claims. Do not write copy
that claims crystals cure or treat conditions.

## 14. Technical Consistency Rules

Brand changes must follow `PROJECT_RULES.md`.

Always:

- Reuse existing components
- Reuse existing layouts
- Keep business logic unchanged
- Keep data access through tRPC
- Keep Prisma access inside server/backend only
- Preserve current architecture

Never:

- Introduce new UI libraries
- Create random one-off styles
- Duplicate `BrandLogo`
- Duplicate admin layout
- Create new branding names
- Add unrelated visual systems

## 15. Naming Rules

Official name: **Ametta Crystals**

Allowed short form: **Ametta**

Unless explicitly requested, always use: **Ametta Crystals**

## 16. AI / Copilot Rules

When Copilot CLI modifies the project, it must:

- Read this file before making branding or UI changes.
- Read `docs/PROJECT_RULES.md`.
- Preserve the current architecture.
- Maintain Portuguese (Portugal) as default UI language.
- Reuse existing components.
- Avoid introducing new styles, libraries or patterns.
- Keep storefront and admin visually consistent.
- Never generate new references to "Crystal Shop".
- Use "Ametta Crystals" as the official brand.
- Prioritize elegant, calm and premium design.

## 17. Practical Implementation Priorities

When applying this brand guide, follow this order:

1. Replace visible "Crystal Shop" references.
2. Update metadata and browser titles.
3. Create or update reusable `BrandLogo`.
4. Apply branding to Navbar.
5. Apply branding to `AdminSidebar`.
6. Improve homepage copy.
7. Improve product presentation.
8. Improve admin visual consistency.
9. Only then proceed to checkout, payments or production deployment.

## 18. Definition of Done for Branding

Branding work is considered complete when:

- No visible "Crystal Shop" references remain.
- Navbar uses Ametta Crystals branding.
- AdminSidebar uses Ametta Crystals branding.
- Browser title uses Ametta Crystals.
- Metadata uses Ametta Crystals.
- Homepage copy feels premium and aligned with the brand.
- Product cards visually match the brand direction.
- Admin remains functional but visually consistent.
- No business logic was changed.
