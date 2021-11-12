import { getChunkSource } from '@/api/debugApi';

export declare type Topology = {
  baseAddr?: string;
  population?: number;
  connected?: number;
  timestamp?: Date;
  nnLowWatermark?: number;
  depth?: number;
  bins?: Record<
    string,
    {
      population?: number;
      connected?: number;
      disconnectedPeers?: null | string[];
      connectedPeers?: null | string[];
    }
  >;
  lightNodes?: {
    connected: number;
    connectedPeers: null | Peers;
    disconnectedPeers: null | Peers;
    population: number;
  };
};
export declare type Peer = { address: string; fullNode: boolean };
export declare type Peers = Peer[];

export declare type Addresses = {
  overlay?: string;
  underlay?: string[];
  public_key?: string;
  network_id?: number;
  public_ip?: {
    ipv4: string;
    ipv6: string;
  };
  nat_route?: string[];
};

export declare type FileType = {
  fileHash: string;
  fileSize: number;
  size: number;
  pinState: boolean;
  bitVector: {
    len: number;
    b: string;
  };
};

export declare type FileSub = Record<
  string,
  {
    type?: string;
    name?: string;
    size?: number;
    ext?: string;
    mime?: string;
    hash?: string;
    sub?: FileSub;
  }
>;

export declare type FileInfo = {
  type: string;
  name: string;
  sub: FileSub;
};

export declare type FileInfoMap = Record<
  string,
  FileInfo & { isM3u8?: boolean; manifestSize?: number }
>;

export declare type AllFileInfo = FileType &
  FileInfo & { isM3u8?: boolean; manifestSize?: number };

export declare type FileAttr = {
  isTar: boolean;
  pin: boolean;
  name: string;
  dOpen: string;
  eOPen: string;
};

export declare type ChunkSource = {
  pyramidSource?: string;
  chunkSource?:
    | {
        overlay: string;
        chunkBit: {
          len: number;
          b: string;
        };
      }[]
    | null;
};
