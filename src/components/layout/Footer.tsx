export function Footer() {
  return (
    <footer className="desktop-only container mt-28 mb-8">
      <div className="surface grid grid-cols-4 p-12 gap-8">
        <div>
          <b className="block mb-4">
            ◯<br />
            Segurança da carteira
          </b>
          <p className="muted text-sm leading-6">
            Proteja sua carteira e colecione arte digital verificada com
            confiança.
          </p>
        </div>
        <div>
          <b className="block mb-4">
            ◯<br />
            Criadores em destaque
          </b>
          <p className="muted text-sm leading-6">
            Conheça artistas, estúdios e comunidades que moldam a cultura
            digital.
          </p>
        </div>
        <div>
          <b className="block mb-4">
            ◯<br />
            Alertas de lançamentos
          </b>
          <p className="muted text-sm leading-6">
            Receba calendários de cunhagem, novidades e análises.
          </p>
        </div>
        <div>
          <b>Antecipe-se ao próximo lançamento</b>
          <div className="flex mt-4">
            <input className="field" placeholder="digite seu e-mail..." />
            <button className="btn btn-primary">Enviar</button>
          </div>
        </div>
      </div>
      <div className="bg-[#38220f] py-7 px-8 flex justify-between text-sm">
        <b>KURIO</b>
        <span>Feito para colecionadores, criadores e cultura</span>
        <span>contato@email.com</span>
        <span>+55 11 4002 8922</span>
      </div>
      <div className="surface grid grid-cols-4 p-10 gap-8 text-sm leading-7">
        <div>
          <b>Meu perfil</b>
          <br />
          Minha coleção
          <br />
          Atividade
          <br />
          Lista de interesse
        </div>
        <div>
          <b>Central de ajuda</b>
          <br />
          Como comprar NFTs
          <br />
          Carteira e segurança
          <br />
          Política do mercado
        </div>
        <div>
          <b>Coleções</b>
          <br />
          Arte digital
          <br />
          Fotografia
          <br />
          Música
          <br />
          Arte 3D
        </div>
        <div>
          <b>Redes sociais</b>
          <br />
          Instagram · X · LinkedIn
          <br />
          <br />
          <b>Carteiras compatíveis</b>
        </div>
      </div>
      <p className="text-center text-xs mt-5">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  );
}
