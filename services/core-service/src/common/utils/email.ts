import { AppError } from "../../libs/errors/app.error"

type SendEmailParams = {
  serviceId: string
  templateId: string
  publicKey: string
  email: string
  name: string
  token: string
  link:string
  recaptcha?: string
}

export const sendEmail = async ({
  serviceId,
  templateId,
  publicKey,
  email,
  name,
  token,
  recaptcha,
  link
}: SendEmailParams) => {

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: email,
      username: name,
      token: token,
      link:link,
      "g-recaptcha-response": recaptcha
    }
  }

  try {
    const res = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    )

    if (!res.ok) {
      throw new Error("Failed to send email")
    }

    return { success: true }
  } catch (error) {
    console.log(error)
    throw new AppError('Invalid sending verify email', 404)
  }
}