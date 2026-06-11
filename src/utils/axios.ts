import axios from "axios";
import {SocksProxyAgent} from "socks-proxy-agent";

const agent = process.env.AGENT_PROXY! ? new SocksProxyAgent(process.env.AGENT_PROXY!) : null;

export default axios.create({
    httpsAgent: agent,
    proxy: false
})