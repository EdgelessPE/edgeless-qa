import express from "express";
import bodyParser from "body-parser";
import { TaskManager } from "./task";
import { PORT, TASK_DIR } from "./constants";
import { EndReq, TakeShotReq } from "../types";
import { beginATask, end, start, takeShot } from "./controllers";
import { sleep, useTimeout } from "./utils";
import { startVM, stopVM } from "./vm";

const app = express();
const taskManager = new TaskManager(TASK_DIR);
const { refresh } = useTimeout(async (times) => {
  if (times > 3) {
    console.log("Error:Worker timeout without response");
  } else {
    // 重启虚拟机再次尝试
    const stopRes = await stopVM();
    if (stopRes.ok) {
      await sleep(10000);
      const startRes = await startVM();
      if (startRes.ok) {
        return;
      } else {
        console.log("Error:Failed to start VM when timeout");
      }
    } else {
      console.log("Error:Failed to stop VM when timeout");
    }
  }
  process.exit(2);
});

app.use(bodyParser.json());
app.use((_req, _res, next) => {
  refresh();
  next();
});
app.get("/start", (req, res) => {
  start(taskManager).then((opt) => res.json(opt));
});
app.use("/storage", express.static(TASK_DIR));
app.post("/takeShot", (req, res) => {
  const body: TakeShotReq = req.body;
  takeShot(body).then((r) => res.json(r));
});
app.post("/end", async (req, res) => {
  const body: EndReq = req.body;
  end(body, taskManager).then((r) => {
    res.json(r);
    if (r.ok && r.val) {
      process.exit();
    }
  });
});

app.listen(PORT, () => {
  console.log(`Master listening on port ${PORT}`);
  beginATask(taskManager).then((lRes) => {
    if (lRes.err) {
      console.error(JSON.stringify(lRes, null, 2));
    } else if (lRes.val) {
      process.exit();
    }
  });
});
