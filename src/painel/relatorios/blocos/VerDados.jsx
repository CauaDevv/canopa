/* A tabela por trás de um gráfico: todo valor do desenho também está aqui (leitor de tela, quem não distingue cores). */
export default function VerDados({ legenda, colunas, linhas }) {
  return (
    <details className="rel-dados">
      <summary>Ver os dados em tabela</summary>
      <div className="rel-dados-rolagem">
        <table>
          <caption className="sr-only">{legenda}</caption>
          <thead>
            <tr>
              {colunas.map((c, i) => (
                <th key={c} scope="col" className={i ? 'num' : undefined}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map(([rotulo, ...valores]) => (
              <tr key={rotulo}>
                <th scope="row">{rotulo}</th>
                {valores.map((v, i) => (
                  <td key={i} className="num">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
