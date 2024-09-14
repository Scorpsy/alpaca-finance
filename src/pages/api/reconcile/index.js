// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import supabase from "@/utilities/supabase/backend";

export default async function handler(_req, res) {
  const { data } = await supabase.from("user").select("*");

  /*
  * `deposits` is a hardcoded object represents the net financial position for each user in the MVP of a record-keeping system using Git.
  * Each key is a string formed by concatenating the user's first and last names.
  * Each value represents the net amount in their account:
  *    - Positive values denote net deposits.
  *    - Negative values denote net withdrawals.
  * 
  * Example Usage:
  *    deposits["JohnDoe"] // 5250  => John Doe has a net deposit of 5250.
  *    deposits["JaneDoe"] // -12400 => Jane Doe has a net withdrawal of 12400.
  */
  const deposits = {
    AndyMa: 0,
    LeonLin: 0,
    HenryShang: 0,
    NicholasWong: 0,
    MatthewArinanta: 0,
    KevinZhu: 0,
    AdrianLam: 0,
    VivianXu: 0,
    AndyKwan: 0,
    PhillipLiu: 0,
    Charlesnull: 0
  };

  // consolidate payee amount of each user
  const payeeAmount = {};
  await Promise.all(
    data.map(async (user) => {
      const { data: payeeData, error: payeeError } = await supabase
        .from("payment")
        .select("amount")
        .eq("payee_user_id", user.id)
        .eq("state", "successful");

      if (payeeError) {
        console.error(`error: ${JSON.stringify(payeeError)}`);
        return res.status(500).json({ error: payeeError });
      }

      payeeAmount[user.first_name + user.last_name] = payeeData.reduce(
        (acc, curr) => acc + curr.amount,
        deposits[user.first_name + user.last_name]
      );
    })
  );

  // consolidate payer amount of each user
  const payerAmount = {};
  await Promise.all(
    data.map(async (user) => {
      const { data: payerData, error: payerError } = await supabase
        .from("payment")
        .select("amount")
        .eq("payer_user_id", user.id)
        .eq("state", "successful");

      if (payerError) {
        console.error(`error: ${JSON.stringify(payerError)}`);
        return res.status(500).json({ error: payerError });
      }

      payerAmount[user.first_name + user.last_name] = payerData.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );
    })
  );

  // compare payee amount and payer amount
  const reconcileData = {};
  Object.keys(payeeAmount).forEach((key) => {
    const u = data.find((user) => user.first_name + user.last_name === key);
    const payee = payeeAmount[key];
    const payer = payerAmount[key];
    const total = payee - payer - u.balance
    if (Math.abs(total) > 0.01) {
      reconcileData[key] = total;
    } else {
      reconcileData[key] = 0;
    }
  });

  res.status(200).json({ data: reconcileData });
}
