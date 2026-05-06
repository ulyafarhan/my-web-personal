export interface IPengaturan {
  kunci: string;
  nilai: string;
  grup: string;
}

export interface IPengaturanRepository {
  ambilSemua(): Promise<IPengaturan[]>;
  ambilBerdasarkanKunci(kunci: string[]): Promise<IPengaturan[]>;
  simpanBatch(entri: IPengaturan[]): Promise<void>;
}
