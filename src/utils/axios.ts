import {Axios} from "axios";
import {HttpsProxyAgent} from "https-proxy-agent";

const agent = process.env.AGENT_PROXY! ? new HttpsProxyAgent(process.env.AGENT_PROXY!) : null;

export default new Axios({
    httpsAgent: agent,
    proxy: false
})