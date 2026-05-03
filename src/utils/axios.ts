import axios from "axios";
import {HttpsProxyAgent} from "https-proxy-agent";

const agent = process.env.AGENT_PROXY! ? new HttpsProxyAgent(process.env.AGENT_PROXY!) : null;

export default axios.create({
    httpsAgent: agent,
    proxy: false
})