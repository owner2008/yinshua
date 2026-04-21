import { Injectable } from '@nestjs/common';
import { QuoteSnapshot } from '../interfaces/quote-result.interface';

@Injectable()
export class QuoteSnapshotService {
  private readonly snapshots = new Map<string, QuoteSnapshot>();

  save(quoteNo: string, snapshot: QuoteSnapshot): QuoteSnapshot {
    this.snapshots.set(quoteNo, structuredClone(snapshot));
    return snapshot;
  }

  findByQuoteNo(quoteNo: string): QuoteSnapshot | undefined {
    const snapshot = this.snapshots.get(quoteNo);
    return snapshot ? structuredClone(snapshot) : undefined;
  }
}
