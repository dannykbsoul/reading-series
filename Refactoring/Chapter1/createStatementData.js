class PerformanceCalculator {
  constructor(aPerformance, play) {
    this.aPerformance = aPerformance;
    this.play = play;
  }
  get amount() {
    throw new Error('subclass responsibility');
  }
  get volumeCredits() {
    return Math.max(this.aPerformance.audience - 30, 0);
  }
}

class TragedyPerformanceCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.aPerformance.audience > 30) {
      result += 1000 * (this.aPerformance.audience - 30);
    }
    return result;
  }
}

class ComedyPerformanceCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.aPerformance.audience > 20) {
      result += 10000 + 500 * (this.aPerformance.audience - 20);
    }
    result += 300 * this.aPerformance.audience;
    return result;
  }

  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.aPerformance.audience / 5);
  }
}

function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
      case "tragedy": return new TragedyPerformanceCalculator(aPerformance, aPlay);
      case "comedy": return new ComedyPerformanceCalculator(aPerformance, aPlay);
      default:
        throw new Error(`unknown type: ${aPlay.type}`);
    }
}

export default function createStatementData(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  return statementData;

  function enrichPerformance(aPerformance) {
    const caculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
    const result = Object.assign({}, aPerformance);
    result.play = caculator.play;
    result.amount = caculator.amount;
    result.volumeCredits = caculator.volumeCredits;
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID]
  }

  function amountFor(aPerformance) {
    let result = 0;
    switch (aPerformance.play.type) {
      case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`unknown type: ${aPerformance.play.type}`);
    }
    return result;
  }

  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    // add extra credit for every ten comedy attendees
    if ("comedy" === aPerformance.play.type) result += Math.floor(aPerformance.audience / 5);
    return result;
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0)
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0)
  }
}
