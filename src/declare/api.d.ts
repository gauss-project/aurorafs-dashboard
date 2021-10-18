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
export declare type FileInfo = {
  type?: string;
  sub?: {};
  name?: string;
  size?: number;
  ext?: string;
  mime?: string;
  manifestSize?: number;
};

export declare type FileInfoMap = Record<
  string,
  FileInfo & { isM3u8?: boolean }
>;

export declare type AllFileInfo = FileType & FileInfo & { isM3u8?: boolean };
