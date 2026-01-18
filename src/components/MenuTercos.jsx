import "./MenuTercos.css";

function normalizeTerco(terco, index) {
  const id = terco?.id ?? terco?.title ?? `terco-${index}`;
  const rawTitle = terco?.title ?? terco?.nome ?? `Terço ${index + 1}`;
  const title = rawTitle.replace(/\s*[-–—]\s*completo\b/gi, "");
  const subtitle =
    terco?.subtitle ??
    terco?.descricao ??
    "Reze com devoção e recolhimento";

  // Esperado: steps: [{ label, text }]
  // Se seu textos.js for diferente, você só ajusta essa parte.
  const steps = Array.isArray(terco?.steps)
    ? terco.steps
    : Array.isArray(terco?.oracoes)
      ? terco.oracoes.map((o, i) => ({
          label: o?.titulo ?? `Oração ${i + 1}`,
          text: o?.texto ?? String(o),
        }))
      : [];

  return { ...terco, id, title, subtitle, steps };
}

export default function MenuTercos({ tercos = [], onSelect }) {
  const list = (tercos || []).map(normalizeTerco);

  return (
    <div className="menu">
      <div className="menu__hero">
        <h1 className="menu__title">Terço Online: oração cotidiana</h1>
        <p className="menu__desc">
          A oração fortalece a fé e renova as forças. Escolha um terço, consagre um tempo a Deus e retome a oração a qualquer momento.
        </p>
      </div>

      <div className="menu__grid">
        {list.map((t) => (
          <button
            key={t.id}
            className="card"
            onClick={() => onSelect?.(t)}
          >
            <div className="card__top">
              <div className="card__title">{t.title}</div>
              <div className="card__subtitle">{t.subtitle}</div>
            </div>

            <div className="card__bottom">
              <div className="card__cta">Rezar</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
