import Agenda, { Job } from "agenda";
import { db, pool } from "../config/database";
import { Battle, queries } from "../utils/postgres";
import { cf, Codeforces } from "../utils/codeforces";

const mongoConnectionString =
  process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017/agenda";

export const agenda = new Agenda({
  db: {
    address: mongoConnectionString,
  },
});
// Define job for starting battles
agenda.define("battle:start", async (job: Job<{ battleId: number }>) => {
  const { battleId } = job.attrs.data;
  console.log(`Starting battle ${battleId}`);

  const battle = await db.getBattleById(battleId);
  if (!battle) {
    console.error(`Battle ${battleId} not found`);
    return;
  }

  const client = await pool.connect();

  try {
    client.query("BEGIN");
    // choose problems

    const problems = await cf.chooseProblems(
      battle.min_rating,
      battle.max_rating,
      battle.num_problems
    );

    for (const problem of problems) {
      await db.query(
        queries.INSERT_PROBLEM_TO_BATTLE,
        [battleId, problem.contestId, problem.index, problem.rating],
        client
      );
    }

    await db.query(queries.START_BATTLE, [battleId], client);
    console.log(`Battle ${battleId} started successfully`);

    agenda.every("5 minutes", "battle:poll-submissions", {
      battle: battle,
      problems: problems,
      battleId: battleId,
    });

    agenda.schedule(
      new Date(Date.now() + battle.duration_min * 60 * 1000),
      "battle:end",
      { battleId: battleId }
    );

    await client.query("COMMIT");
    console.log(`Scheduled polling for battle ${battleId}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`Failed to start battle ${battleId}:`, error);
  } finally {
    client.release();
  }
});

agenda.define(
  "battle:poll-submissions",
  async (
    job: Job<{
      battle: Battle;
      problems: Codeforces.Problem[];
      battleId: number;
    }>
  ) => {
    const { battle, problems } = job.attrs.data;
    console.log(`Polling submissions for battle ${battle.id}`);

    // fetch submissions from cf
  }
);

agenda.define("battle:end", async (job: Job<{ battleId: number }>) => {
  const { battleId } = job.attrs.data;
  console.log(`Ending battle ${battleId}`);
  const client = await pool.connect();
  try {
    client.query("BEGIN");
    const battle = await db.getBattleById(battleId);
    if (!battle) {
      console.error(`Battle ${battleId} not found`);
      return;
    }
    await db.query(queries.END_BATTLE, [battleId], client);
    console.log(`Battle ${battleId} ended successfully`);
    await client.query("COMMIT");

    agenda.cancel({ "data.battleId": battleId });
  } catch (error) {
    console.error(`Failed to end battle ${battleId}:`, error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
});

// Define job for cleaning up expired verifications
// agenda.define("delete expired verifications", async (job: Job) => {
//   await db.query(queries.DELETE_EXPIRED_VERIFICATIONS, []);
//   console.log("Expired verifications deleted");
// });

// Schedule recurring cleanup job
agenda.on("ready", async () => {
  // await agenda.every("5 minutes", "delete expired verifications");

  agenda.start();
});
