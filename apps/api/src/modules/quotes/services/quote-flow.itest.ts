import '../../../load-env';
import assert from 'node:assert/strict';
import { before, after, describe, it } from 'node:test';
import { PrismaService } from '../../../database/prisma.service';
import { MembersService } from '../../members/members.service';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { QuoteCalcService } from './quote-calc.service';
import { QuoteConfigRepository } from './quote-config.repository';
import { QuoteRuleMatcherService } from './quote-rule-matcher.service';
import { QuoteService } from './quote.service';
import { QuoteSnapshotService } from './quote-snapshot.service';
import { QuoteValidatorService } from './quote-validator.service';

const wxOpenid = 'it_mock_quote_flow';
let prisma: PrismaService;
let quoteService: QuoteService;
let membersService: MembersService;
let userId: number;

describe('quote flow integration', () => {
  before(async () => {
    assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required for integration tests');
    prisma = new PrismaService();
    await prisma.$connect();
    await cleanup();
    const user = await prisma.user.create({
      data: {
        wxOpenid,
        nickname: 'Integration User',
      },
    });
    userId = Number(user.id);

    const repository = new QuoteConfigRepository(prisma);
    quoteService = new QuoteService(
      new QuoteRuleMatcherService(repository),
      new QuoteValidatorService(),
      new QuoteCalcService(),
      new QuoteSnapshotService(),
      prisma,
    );
    membersService = new MembersService(prisma);
  });

  after(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('calculates, saves, and reads member quote history from MySQL', async () => {
    const calculated = await quoteService.calculate(sampleInput);
    assert.equal(calculated.summary.finalPrice, 542.24);

    const saved = await quoteService.create(sampleInput, userId);
    assert.equal(saved.summary.finalPrice, 542.24);

    const found = await quoteService.findOne(saved.quoteNo);
    assert.equal(found?.quoteNo, saved.quoteNo);
    assert.equal(found?.summary.finalPrice, 542.24);

    const history = await membersService.findQuotes(userId);
    assert.ok(history.some((quote) => quote.quoteNo === saved.quoteNo));

    const detail = await membersService.findQuote(userId, saved.quoteNo);
    assert.equal(detail.quoteNo, saved.quoteNo);
    const fullSnapshot = detail.snapshot?.fullSnapshotJson as { quoteNo?: string } | undefined;
    assert.equal(fullSnapshot?.quoteNo, saved.quoteNo);
  });
});

async function cleanup() {
  const users = await prisma.user.findMany({
    where: { wxOpenid },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);
  if (userIds.length === 0) {
    return;
  }

  const quotes = await prisma.quote.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const quoteIds = quotes.map((quote) => quote.id);
  await prisma.quoteSnapshot.deleteMany({ where: { quoteId: { in: quoteIds } } });
  await prisma.quote.deleteMany({ where: { id: { in: quoteIds } } });
  await prisma.memberAddress.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.memberProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

const sampleInput: CreateQuoteDto = {
  productId: 1,
  productTemplateId: 1,
  widthMm: 100,
  heightMm: 80,
  quantity: 5000,
  materialId: 2,
  printMode: 'four_color',
  shapeType: 'rectangle',
  processCodes: ['lamination', 'die_cut'],
  isProofing: false,
  isUrgent: false,
  customerType: 'company',
};
