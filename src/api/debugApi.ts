import request from '@/utils/request';
import {AxiosResponse} from "axios"
import {Topology,Peers} from '@/declare/api'

export const getHealth = (url:string):Promise<any> => {
  return request({
    url:url + "/health",
  })
}

export const getTopology = (url:string):Promise<AxiosResponse<Topology>> => {
  return request({
    url:url + "/topology",
  })
}

export const getPeers= (url:string):Promise<AxiosResponse<Peers>> => {
  return request({
    url:url + "/peers",
  })
}

export const getAddresses= (url:string):Promise<AxiosResponse<Peers>> => {
  return request({
    url:url + "/addresses",
  })
}

export default {
  getHealth,
  getTopology,
  getPeers,
  getAddresses
}
