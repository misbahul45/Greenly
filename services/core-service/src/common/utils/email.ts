import { AppError } from "../../libs/errors/app.error"

type SendEmailParams = {
  serviceId: string
  templateId: string
  userId: string
  accessToken: string
  email: string
  name: string
  token: string
}

export const sendEmail = async ({
  serviceId,
  templateId,
  userId,
  accessToken,
  email,
  name,
  token,
}: SendEmailParams) => {

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    accessToken: accessToken,
    template_params: {
      to_email: email,
      username: name,
      token: token,
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
      const text = await res.text()
      console.log("EmailJS error:", text)
      throw new Error("Failed to send email")
    }

    return { success: true }
  } catch (error) {
    console.log(error)
    throw new AppError('Invalid sending verify email', 404)
  }
}