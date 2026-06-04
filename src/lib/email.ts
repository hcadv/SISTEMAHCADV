import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendNewClientNotification(data: {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  descricaoCaso: string;
}) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "contato@hca.adv.br",
    subject: `Novo Cliente: ${data.nome} - HC Advogados`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 20px; text-align: center;">
          <h1 style="color: #c9a84c; margin: 0;">HC Advogados</h1>
          <p style="color: white; margin: 5px 0 0 0;">Novo cadastro de cliente</p>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1e3a5f;">Dados do novo cliente</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #374151;">Nome:</td>
              <td style="padding: 8px; color: #111827;">${data.nome}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 8px; font-weight: bold; color: #374151;">CPF:</td>
              <td style="padding: 8px; color: #111827;">${data.cpf}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 8px; color: #111827;">${data.email}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 8px; font-weight: bold; color: #374151;">Telefone:</td>
              <td style="padding: 8px; color: #111827;">${data.telefone}</td>
            </tr>
          </table>
          <h3 style="color: #1e3a5f; margin-top: 20px;">Descrição do caso:</h3>
          <p style="color: #374151; background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #c9a84c;">
            ${data.descricaoCaso}
          </p>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.APP_URL}/clientes"
               style="background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Ver no Sistema
            </a>
          </div>
        </div>
        <div style="background: #1e3a5f; padding: 15px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            HENRIQUE CHAHINE ADVOGADOS - CNPJ: 58.044.571/0001-08
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
