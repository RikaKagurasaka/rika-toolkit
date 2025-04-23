import BigNumber from "bignumber.js";
import Fraction from "fraction.js";

export function continuedFraction(
  input: BigNumber,
  maxIterations: number,
  isFinite: Ref<boolean>
) {
  const result = [];
  let a = input;
  let b = new BigNumber(1);
  if (a.isNaN() || a.eq(0)) {
    return [];
  }
  isFinite.value = false;

  for (let i = 0; i < maxIterations; i++) {
    const q = a.idiv(b);
    result.push(q.toNumber());
    const temp = a.minus(q.times(b));
    if (temp.eq(0)) {
      isFinite.value = true;
      break;
    }
    a = b;
    b = temp;
  }

  return result;
}

export function parseInput(input: string): BigNumber | null {
  let rs = new BigNumber(input);
  if (rs.isNaN()) {
    if (input.includes("/")) {
      const [n, d] = input.split("/").map((v) => new BigNumber(v));
      if (n.isNaN() || d.isNaN()) {
        return null;
      }
      rs = n.div(d);
    }
  }
  return rs;
}
