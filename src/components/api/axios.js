import axios from "axios";

export default axios.create({
   //baseURL: "http://localhost:5000/api/v1"
   baseURL: "https://uptight-bobby-main-dm-organization-ef102bc4.koyeb.app/api/v1"
   //baseURL: "https://vitreous-elk-digitalmaking-719d936f.koyeb.app/api/v1"
})
