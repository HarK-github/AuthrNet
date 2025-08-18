// utils/uploadToPinata.ts
import axios from "axios"

export const uploadToPinata = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const metadata = JSON.stringify({
    name: file.name,
  })
  formData.append("pinataMetadata", metadata)

  const options = JSON.stringify({
    cidVersion: 0,
  })
  formData.append("pinataOptions", options)

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "multipart/form-data",
      pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
      pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
    },
  })

  return res.data.IpfsHash  
}
