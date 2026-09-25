(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    gameApp: $("#gameApp"),
    stage: $("#stage"),
    startScreen: $("#startScreen"),
    startButton: $("#startButton"),
    clearScreen: $("#clearScreen"),
    playAgainButton: $("#playAgainButton"),
    bgmAudio: $("#bgmAudio"),
    soundButton: $("#soundButton"),
    resetButton: $("#resetButton"),
    infoMenuButton: $("#infoMenuButton"),
    infoCloseButton: $("#infoCloseButton"),
    infoBackdrop: $("#infoBackdrop"),
    infoPanel: $("#infoPanel"),
    drawerSoundButton: $("#drawerSoundButton"),
    drawerResetButton: $("#drawerResetButton"),
    dialogueStrip: $("#dialogueStrip"),
    dialogueBody: $("#dialogueBody"),
    dialogueCloseButton: $("#dialogueCloseButton"),
    dialogueName: $("#dialogueName"),
    dialogueText: $("#dialogueText"),
    objectiveText: $("#objectiveText"),
    progressRow: $("#progressRow"),
    inventory: $("#inventory"),
    clueList: $("#clueList"),
    roomHintButton: $("#roomHintButton"),
    turnLeftButton: $("#turnLeftButton"),
    turnRightButton: $("#turnRightButton"),
    viewName: $("#viewName"),
    viewDots: $("#viewDots"),
    swipeHint: $("#swipeHint"),
    windowVeil: $("#windowVeil"),
    mechanismCard: $("#mechanismCard"),
    mechanismIcon: $("#mechanismIcon"),
    mechanismText: $("#mechanismText"),
    particleLayer: $("#particleLayer"),
    discoveryCount: $("#discoveryCount"),
    avatarFrame: $("#avatarFrame"),
    avatarSprite: $("#avatarSprite"),
    poseCounter: $("#poseCounter"),
    windowSpot: $("#windowSpot"),
    windowGimmickSpot: $("#windowGimmickSpot"),
    windowGimmickIcon: $("#windowGimmickIcon"),
    windowGimmickLabel: $("#windowGimmickLabel"),
    pipeSpot: $("#pipeSpot"),
    floorSpot: $("#floorSpot"),
    monitorSpot: $("#monitorSpot"),
    terrariumSpot: $("#terrariumSpot"),
    drawerSpot: $("#drawerSpot"),
    chargerSpot: $("#chargerSpot"),
    lightSpot: $("#lightSpot"),
    ceilingPanelSpot: $("#ceilingPanelSpot"),
    ceilingGlyph: $("#ceilingGlyph"),
    memoSpot: $("#memoSpot"),
    doorSpot: $("#doorSpot"),
    lampSpot: $("#lampSpot"),
    panelSpot: $("#panelSpot"),
    hatchSpot: $("#hatchSpot"),
    safeSpot: $("#safeSpot"),
    intercomSpot: $("#intercomSpot"),
    treeObject: $("#treeObject"),
    airObject: $("#airObject"),
    puzzleDialog: $("#puzzleDialog"),
    puzzleKicker: $("#puzzleKicker"),
    puzzleTitle: $("#puzzleTitle"),
    puzzleDetail: $("#puzzleDetail"),
    choiceGrid: $("#choiceGrid"),
    answerForm: $("#answerForm"),
    answerLabel: $("#answerLabel"),
    answerInput: $("#answerInput"),
    puzzleFeedback: $("#puzzleFeedback"),
    puzzleHintButton: $("#puzzleHintButton"),
    puzzleCloseButton: $("#puzzleCloseButton"),
    puzzleContinueButton: $("#puzzleContinueButton"),
    toastRegion: $("#toastRegion")
  };

  const initialState = () => ({
    started: false,
    plantSeen: false,
    q1Done: false,
    battery: false,
    batteryCharged: false,
    q3Done: false,
    treeSolved: false,
    airSolved: false,
    finalSolved: false,
    mistakes: 0,
    hints: 0,
    sound: true,
    clues: [],
    pose: "sleep",
    view: "center",
    seenPoses: ["sleep"],
    poseRewarded: false,
    discoveries: [],
    discoveryRewarded: false,
    avatarTaps: 0,
    nextPoseTap: 4,
    windowClosed: false,
    windowToggles: 0,
    windowLightSeen: false,
    windowDarkSeen: false,
    pipeTurns: 0,
    valveNumberSeen: false,
    floorTaps: 0,
    lightMode: 0,
    ceilingTaps: 0,
    ceilingSeen: false,
    memoSeen: false,
    lampTaps: 0,
    panelTaps: 0,
    hatchOpen: false,
    safeOpened: false,
    intercomTaps: 0
  });

  let state = initialState();
  let activePuzzle = null;
  let audioContext = null;
  let idleTimer = null;
  let poseTimer = null;
  let mechanismTimer = null;
  let dialogueTimer = null;
  let pointerStart = null;
  let lastRandomMessage = "";
  const drawerMedia = window.matchMedia("(max-width: 1024px), (orientation: landscape) and (max-height: 650px)");
  const compactLandscapeMedia = window.matchMedia("(orientation: landscape) and (max-height: 650px)");

  const ALL_POSES = [
    "sleep", "stand", "walk", "look", "startled", "grumpy",
    "point", "sit", "pillow", "tools", "cat", "buns"
  ];
  const poseImageCache = new Map();

  const POSE_NAMES = {
    sleep: "すやすや", stand: "きりっ", walk: "てくてく", look: "きょろきょろ",
    startled: "びっくり", grumpy: "むすっ", point: "ひらめき", sit: "ぺたん",
    pillow: "まくら投げ", tools: "工具箱", cat: "黒猫といっしょ", buns: "おまんじゅう"
  };

  const VIEWS = [
    { id: "left", name: "窓側", pose: "look", message: "窓側。大きな窓と、真鍮のバルブ。開け閉めで何か変わりそう。" },
    { id: "center", name: "正面", pose: "stand", message: "正面。机の上も、天井の星形パネルも気になる。" },
    { id: "right", name: "扉側", pose: "grumpy", message: "扉側。出口の横に、4桁の金庫まで増えてる。忙しい壁。" }
  ];

  const RANDOM_MESSAGES = [
    "つついた？　いま、つついたよね。",
    "このフード、耳まであるけど聞こえ方は普通です。たぶん。",
    "脱出より先に、おやつの出口を探してもいい？",
    "壁を三回押すと秘密の扉……は、出ませんでした。",
    "空気にも重さがあるなら、ため息もちょっと重いのかな。",
    "見てないところで、部屋が少し動いている気がする。",
    "わたしは非常食ではありません。おまんじゅうも違います。",
    "そのうち全部のしぐさ、見つけられるかも。",
    "床がつるつる。走ると、たぶん負ける。",
    "黒い猫を見かけたら、わたしにも教えて。",
    "謎はむずかしくても、ボタンはだいたい押してよし。",
    "もう一回？　しょうがないなあ。",
    "数字は覚えるより、メニューの手がかりに任せよう。",
    "窓を閉めると静か。わたしのひとりごとは静かにならない。",
    "天井まで調べる脱出者、かなり抜け目がない。",
    "金庫の中身が金とは限らない。おやつなら大当たり。",
    "インターホンの向こう、誰もいないのによくしゃべる。",
    "三つの壁、ちゃんと別の顔になったね。"
  ];

  const IDLE_MESSAGES = [
    ["……ちょっとだけ休憩。部屋は逃げないし。", "sleep"],
    ["あのボタン、押してほしそうな顔をしてる。", "point"],
    ["静かすぎるので、足音だけ出してみる。てくてく。", "walk"],
    ["クッションがあったら、謎解き効率が上がると思う。", "pillow"],
    ["座って見ると、床の違和感がよく分かるかも。", "sit"],
    ["工具は持った。直せるとは言っていない。", "tools"],
    ["どこかで猫の気配……わたし以外の。", "cat"]
  ];

  const puzzles = {
    q1: {
      kicker: "EXIT TEST 01",
      title: "100年後、箱全体の質量は？",
      detail: "完全に密閉された箱に、植物・土・水・空気がある。物質は出入りせず、光だけが外から入る。植物は大きく成長した。",
      options: [
        ["A", "増える"],
        ["B", "減る"],
        ["C", "ほとんど変わらない"]
      ],
      acceptAny: true,
      hint: "植物だけでなく、箱・土・水・空気を全部まとめて考える。光は物質ではないけれど、エネルギーではある。",
      success: "《判定保留》——正解も不正解も出ない。入った光と出ていく熱まで決めないと、厳密には一つに定まらないらしい。代わりに、机から「カチッ」と音がした。",
      onComplete() {
        state.q1Done = true;
        elements.monitorSpot.classList.add("done");
        elements.drawerSpot.disabled = false;
        addClue("密閉箱では、物質は外から増えていない。");
        setObjective("開いた引き出しを調べる", 1);
        say("机の引き出しが、ちょっとだけ開いた。親切なのか不親切なのか、よく分からない。", "point");
      }
    },
    q2: {
      kicker: "EXIT TEST 02",
      title: "充電後のバッテリーは重くなる？",
      detail: "残量0%のバッテリーへ、外部からエネルギーだけを送って100%まで充電する。",
      options: [
        ["A", "ほんの少し重くなる"],
        ["B", "まったく変わらない"],
        ["C", "軽くなる"]
      ],
      correct: "A",
      hint: "モニターに《E = mc²》と出ている。エネルギーを蓄えた「系」はどうなる？",
      wrong: "《不正解》でも罰はなし。《HINT  E = mc²》と表示された。",
      success: "《正解》エネルギーを蓄えたぶんだけ質量も増える。1 kWhなら約4×10⁻¹⁴ kg。ちっさ。でも、ゼロではない。",
      onComplete() {
        state.batteryCharged = true;
        elements.chargerSpot.classList.add("done");
        addClue("蓄えたエネルギーにも、ごく小さな質量がある。");
        replaceInventory("battery", "charged", "🔋", "充電済み");
        setObjective("もう一度モニターを見る", 3);
        say("満タン。見た目は同じだけど、さっきよりほんの少し重い。たぶん持っても分からない。", "stand");
      }
    },
    q3: {
      kicker: "EXIT TEST 03",
      title: "光だけで1 kg増やすなら？",
      detail: "植物の乾燥重量が1 kg増えた。その1 kgが、外から入った光のエネルギーそのものだったとしたら、必要なエネルギーは？",
      options: [
        ["A", "一般家庭の1日分くらい"],
        ["B", "大型発電所の1日分くらい"],
        ["C", "人類が簡単には用意できないほど巨大"]
      ],
      correct: "C",
      hint: "1 kWhで増える質量は約4×10⁻¹⁴ kg。1 kgにするには、桁がたいへんなことになる。",
      wrong: "その規模では、1 kgの質量にはまるで届かない。",
      success: "《正解》約2.5×10¹³ kWh、つまり約25兆kWh。植物の1 kgを「光がそのまま質量になった」とは説明できない。",
      onComplete() {
        setView("center", false);
        state.q3Done = true;
        elements.monitorSpot.classList.add("done");
        elements.treeObject.hidden = false;
        addClue("木の質量は、光がそのまま固まったものではない。");
        setObjective("壁から現れた木を調べる", 4);
        say("壁が動いて、大きな木が出てきた。部屋、思ったより奥行きがある。", "startled");
      }
    },
    q4: {
      kicker: "EXIT TEST 04",
      title: "約50 kgの木は、どこから来た？",
      detail: "初期土壌100.0 kg。植物の乾燥重量は+50.0 kg。最終土壌は99.5 kg。",
      options: [
        ["A", "土"],
        ["B", "水"],
        ["C", "光"],
        ["D", "空気"]
      ],
      correct: "D",
      hint: "土は0.5 kgしか減っていない。乾燥重量なので水でもない。光でもないと、さっき確認した。",
      wrong: "数字と、これまでに分かったことをもう一度見てみよう。",
      success: "《回答を受理》植物は大気中のCO₂を取り込み、その炭素から糖やセルロースなどを作る。木の材料のかなりの部分は、もともと空気中にあった。",
      onComplete() {
        state.treeSolved = true;
        elements.treeObject.classList.add("done");
        elements.airObject.hidden = false;
        addClue("木の炭素の主な由来は、空気中のCO₂。");
        setObjective("落ちてきた透明な袋を調べる", 5);
        say("空気が木になる。……見えないものが、ずいぶん立派になった。", "point");
      }
    },
    q5: {
      kicker: "EXIT TEST 05",
      title: "空気 1 m³の質量は？",
      detail: "透明な袋には、常温・1気圧付近の空気が1 m³入っている。",
      options: [
        ["A", "約1 g"],
        ["B", "約100 g"],
        ["C", "約1 kg"],
        ["D", "約10 kg"]
      ],
      correct: "C",
      hint: "ヘリウム風船が浮くのは、ヘリウムが周囲の空気より軽いから。比べられるなら、空気にも重さがある。",
      wrong: "《HINT》大気圧は、上にある空気の重さによって生じている。",
      success: "《正解》常温・1気圧付近の空気1 m³は約1.2 kg。私たちは、巨大な空気の海の底にいる。",
      onComplete() {
        state.airSolved = true;
        elements.airObject.classList.add("done");
        addClue("空気1 m³は約1.2 kg。空気は「何もない」ではない。");
        addInventory("air", "◌", "空気 1 m³");
        setObjective("木をもう一度調べる", 5);
        say("この袋、見た目より重い。空気の海の底にいると思うと、床までちょっと海底っぽい。", "look");
      }
    },
    safe: {
      kicker: "SIDE PUZZLE",
      title: "4桁の金庫",
      detail: "番号のメモに書かれた順番で、部屋に隠れた四つの数字を並べる。",
      type: "text",
      inputLabel: "4桁の番号を入力",
      placeholder: "0000",
      inputMode: "numeric",
      hint: "順番は《暗い窓 → 天井の星 → バルブ → 明るい窓》。窓は開閉すると、見える仕掛けが切り替わる。",
      validate(value) {
        const digits = value
          .replace(/[０-９]/g, (character) => String(character.charCodeAt(0) - 65248))
          .replace(/\D/g, "");
        return digits === "2497";
      },
      wrong: "カチ、カチ、カチ……最後だけ《ぶー》。四つの数字と、メモの順番をもう一度確かめよう。",
      success: "《OPEN》暗い窓の2、天井の4、バルブの9、明るい窓の7。金庫が、ぽこんと開いた。",
      onComplete() {
        state.safeOpened = true;
        elements.safeSpot.classList.add("opened", "done");
        addClue("金庫の番号は 2497（暗い窓・天井・バルブ・明るい窓）。");
        addInventory("starTin", "★", "星形クッキー缶");
        showMechanism("★", "4桁の金庫が開いた！");
        spawnParticles("★", 39, 66, 10);
        say("金庫の中は、星形クッキー。脱出に不要。でも、心には必要。", "buns");
      }
    },
    final: {
      kicker: "FINAL QUESTION",
      title: "木の質量は、どこへ行った？",
      detail: "燃焼シミュレーターの中で、木は少量の灰を残してほとんど見えなくなった。選択肢はない。",
      type: "text",
      hint: "木に含まれる炭素は燃えると主に二酸化炭素に、水素は水蒸気などになる。",
      validate(value) {
        const normalized = value.replace(/\s+/g, "").toLowerCase();
        return ["空気", "くうき", "気体", "きたい", "二酸化炭素", "にさんかたんそ", "水蒸気", "大気"].some((word) => normalized.includes(word));
      },
      wrong: "固体がなくなったように見えるけれど、物質そのものは消えていない。何になって部屋へ広がった？",
      success: "《正解》木の炭素は主に二酸化炭素へ、水素は水蒸気などへ。固体だった物質の多くが気体になり、空気へ戻った。",
      onComplete() {
        setView("right", false);
        state.finalSolved = true;
        elements.doorSpot.classList.add("unlocked");
        addClue("木は消えず、燃焼で主に気体へ姿を変えた。");
        addInventory("key", "✓", "UNLOCKED");
        setObjective("緑になった扉を開ける", 6);
        say("カチッ。扉のランプが緑になった。今度こそ、出られる。", "buns");
        toast("扉のロックが外れた！");
        playSound("unlock");
      }
    }
  };

  function initProgress() {
    elements.progressRow.replaceChildren();
    for (let i = 0; i < 6; i += 1) {
      const pip = document.createElement("span");
      pip.className = "progress-pip";
      elements.progressRow.append(pip);
    }
  }

  function setObjective(text, progress) {
    elements.objectiveText.textContent = text;
    [...elements.progressRow.children].forEach((pip, index) => {
      pip.classList.toggle("filled", index < progress);
    });
    elements.progressRow.setAttribute("aria-label", "進行度 " + progress + " / 6");
  }

  function randomPick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function preloadPoseImages() {
    ALL_POSES.forEach((pose) => {
      const image = new Image();
      image.src = "./assets/poses/" + pose + ".jpg";
      poseImageCache.set(pose, image);
    });
  }

  function nextUnseenPose() {
    const unseen = ALL_POSES.filter((pose) => !state.seenPoses.includes(pose));
    return randomPick(unseen.length ? unseen : ALL_POSES.filter((pose) => pose !== state.pose));
  }

  function setPose(pose) {
    if (!ALL_POSES.includes(pose)) pose = "stand";
    state.pose = pose;
    elements.avatarSprite.className = "sprite pose-" + pose;
    elements.avatarFrame.classList.remove("pop");
    requestAnimationFrame(() => elements.avatarFrame.classList.add("pop"));
    updatePoseCounter();
  }

  function updatePoseCounter() {
    elements.poseCounter.textContent = state.seenPoses.length + " / " + ALL_POSES.length;
    elements.poseCounter.setAttribute("aria-label", "アルバムに記録したしぐさ " + state.seenPoses.length + " / " + ALL_POSES.length);
  }

  function collectPose(pose) {
    if (state.seenPoses.includes(pose)) return false;
    state.seenPoses.push(pose);
    updatePoseCounter();
    toast("「" + POSE_NAMES[pose] + "」をアルバムに記録　" + state.seenPoses.length + " / " + ALL_POSES.length);
    if (state.seenPoses.length === ALL_POSES.length && !state.poseRewarded) {
      state.poseRewarded = true;
      addInventory("posebook", "📷", "12しぐさアルバム");
      toast("全12しぐさ、コンプリート！");
      showMechanism("📷", "12しぐさ、そろった！");
    }
    return true;
  }

  function showDialogue() {
    window.clearTimeout(dialogueTimer);
    elements.dialogueStrip.classList.remove("is-hidden");
    elements.dialogueStrip.setAttribute("aria-hidden", "false");
    elements.dialogueBody.tabIndex = 0;
    if (compactLandscapeMedia.matches && state.started) {
      dialogueTimer = window.setTimeout(() => hideDialogue(), 8000);
    }
  }

  function hideDialogue() {
    window.clearTimeout(dialogueTimer);
    elements.dialogueStrip.classList.add("is-hidden");
    elements.dialogueStrip.setAttribute("aria-hidden", "true");
    elements.dialogueBody.tabIndex = -1;
  }

  function setInfoOpen(open, restoreFocus = true) {
    if (!drawerMedia.matches) return;
    elements.gameApp.classList.toggle("info-open", open);
    elements.infoMenuButton.setAttribute("aria-expanded", String(open));
    elements.infoPanel.inert = !open;
    if (open) {
      hideDialogue();
      window.setTimeout(() => elements.infoCloseButton.focus(), 40);
    } else if (restoreFocus && !elements.gameApp.inert) {
      elements.infoMenuButton.focus();
    }
  }

  function syncResponsiveUi() {
    if (drawerMedia.matches) {
      const open = elements.gameApp.classList.contains("info-open");
      elements.infoPanel.inert = !open;
      elements.infoMenuButton.setAttribute("aria-expanded", String(open));
    } else {
      elements.gameApp.classList.remove("info-open");
      elements.infoPanel.inert = false;
      elements.infoMenuButton.setAttribute("aria-expanded", "false");
    }
    if (!compactLandscapeMedia.matches) {
      window.clearTimeout(dialogueTimer);
      elements.dialogueStrip.classList.remove("is-hidden");
      elements.dialogueStrip.setAttribute("aria-hidden", "false");
      elements.dialogueBody.tabIndex = 0;
    } else if (state.started && !elements.dialogueStrip.classList.contains("is-hidden")) {
      showDialogue();
    }
  }

  function say(text, pose = state.pose, name = "わたし") {
    elements.dialogueName.textContent = name;
    elements.dialogueText.textContent = text;
    setPose(pose);
    showDialogue();
    scheduleIdle();
  }

  function scheduleIdle() {
    window.clearTimeout(idleTimer);
    if (!state.started || state.finalSolved || !elements.clearScreen.hidden) return;
    idleTimer = window.setTimeout(runIdleMoment, 25000 + Math.random() * 15000);
  }

  function runIdleMoment() {
    if (!state.started || state.finalSolved || elements.puzzleDialog.open || !elements.clearScreen.hidden) {
      scheduleIdle();
      return;
    }
    const [message] = randomPick(IDLE_MESSAGES);
    say(message, nextUnseenPose());
    spawnParticles("…", 15, 70, 4);
  }

  function showMechanism(icon, text) {
    window.clearTimeout(mechanismTimer);
    elements.mechanismIcon.textContent = icon;
    elements.mechanismText.textContent = text;
    elements.mechanismCard.hidden = false;
    elements.mechanismCard.classList.remove("show");
    requestAnimationFrame(() => elements.mechanismCard.classList.add("show"));
    mechanismTimer = window.setTimeout(() => {
      elements.mechanismCard.hidden = true;
      elements.mechanismCard.classList.remove("show");
    }, 1700);
  }

  function spawnParticles(symbol = "✦", x = 50, y = 50, amount = 7) {
    for (let i = 0; i < amount; i += 1) {
      const particle = document.createElement("span");
      particle.className = "room-particle";
      particle.textContent = symbol;
      particle.style.left = (x + (Math.random() - .5) * 12) + "%";
      particle.style.top = (y + (Math.random() - .5) * 10) + "%";
      particle.style.setProperty("--drift-x", ((Math.random() - .5) * 55) + "px");
      particle.style.animationDelay = (Math.random() * .12) + "s";
      elements.particleLayer.append(particle);
      window.setTimeout(() => particle.remove(), 1150);
    }
  }

  function markDiscovery(id) {
    if (state.discoveries.includes(id)) return false;
    state.discoveries.push(id);
    elements.discoveryCount.textContent = state.discoveries.length + " / 8";
    toast("部屋の発見 " + state.discoveries.length + " / 8");
    if (state.discoveries.length === 8 && !state.discoveryRewarded) {
      state.discoveryRewarded = true;
      addInventory("observer", "✦", "観察名人バッジ");
      showMechanism("✦", "部屋のひみつ、全部発見！");
    }
    return true;
  }

  function setView(viewId, narrate = true) {
    const view = VIEWS.find((candidate) => candidate.id === viewId) || VIEWS[1];
    const changed = state.view !== view.id;
    state.view = view.id;
    elements.stage.dataset.view = view.id;
    elements.viewName.textContent = view.name;
    elements.stage.setAttribute("aria-label", view.name + "を向いた白い実験室");
    [...elements.viewDots.children].forEach((dot, index) => {
      dot.classList.toggle("active", VIEWS[index].id === view.id);
    });
    if (changed) {
      elements.swipeHint.classList.add("dismissed");
      window.clearTimeout(poseTimer);
      if (narrate) {
        setPose("walk");
        poseTimer = window.setTimeout(() => say(view.message, view.pose), 360);
      }
      playSound("move");
    }
    scheduleIdle();
  }

  function turnView(direction) {
    const current = VIEWS.findIndex((view) => view.id === state.view);
    const next = (current + direction + VIEWS.length) % VIEWS.length;
    setView(VIEWS[next].id);
  }

  function tapAvatar() {
    state.avatarTaps += 1;
    let message;
    let pose;
    let recordsNewPose = false;
    if (state.avatarTaps === 1) {
      message = "わっ。そこを押すと、わたしが動く仕掛けです。";
      pose = "startled";
    } else if (state.avatarTaps === 2) {
      message = "もう一回きた。三回目からは、何を言うか自分でも分からない。";
      pose = "point";
    } else {
      const candidates = RANDOM_MESSAGES.filter((item) => item !== lastRandomMessage);
      message = randomPick(candidates);
      lastRandomMessage = message;
      recordsNewPose = state.seenPoses.length < ALL_POSES.length && state.avatarTaps >= state.nextPoseTap;
      pose = recordsNewPose
        ? nextUnseenPose()
        : randomPick(ALL_POSES.filter((candidate) => candidate !== state.pose));
      if (recordsNewPose) {
        state.nextPoseTap = state.avatarTaps + 5 + Math.floor(Math.random() * 4);
      }
    }
    say(message, pose);
    const recorded = recordsNewPose && collectPose(pose);
    spawnParticles(recorded ? "✦" : "·", 14, 72, recorded ? 6 : 3);
    playSound("tap");
  }

  function addClue(text) {
    if (state.clues.includes(text)) return;
    state.clues.push(text);
    elements.clueList.replaceChildren();
    state.clues.forEach((clue) => {
      const li = document.createElement("li");
      li.textContent = clue;
      elements.clueList.append(li);
    });
  }

  function addInventory(id, icon, name) {
    const existing = elements.inventory.querySelector('[data-item="' + id + '"]');
    if (existing) {
      existing.querySelector(".item-icon").textContent = icon;
      existing.querySelector(".item-name").textContent = name;
      return;
    }
    elements.inventory.querySelector(".empty-inventory")?.remove();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "inventory-item";
    button.dataset.item = id;
    button.innerHTML = '<span class="item-icon" aria-hidden="true">' + icon + '</span><span class="item-name">' + name + "</span>";
    button.addEventListener("click", () => inspectItem(button.dataset.item));
    elements.inventory.append(button);
    toast(name + "を手に入れた");
    playSound("item");
  }

  function replaceInventory(oldId, newId, icon, name) {
    const item = elements.inventory.querySelector('[data-item="' + oldId + '"]');
    if (!item) {
      addInventory(newId, icon, name);
      return;
    }
    item.dataset.item = newId;
    item.querySelector(".item-icon").textContent = icon;
    item.querySelector(".item-name").textContent = name;
    toast(name + "になった");
    playSound("item");
  }

  function inspectItem(id) {
    const descriptions = {
      battery: ["からっぽのバッテリー。持った感じは、ただのバッテリー。", "tools"],
      charged: ["充電済み。増えた質量は約4×10⁻¹⁴ kg／kWh。持っても分からない。", "stand"],
      air: ["空気1 m³。約1.2 kg。何もないように見えて、ちゃんと重い。", "look"],
      key: ["鍵ではないけれど、扉のロックは外れている。十分。", "buns"],
      screw: ["床の下にあった、星みたいな頭のネジ。使い道はないけど、かわいい。", "tools"],
      manju: ["非常用まんじゅう。賞味期限は《脱出するまで》。便利な表記。", "buns"],
      starTin: ["金庫に入っていた星形クッキー。数字の4に似た欠け方をしている気もする。", "buns"],
      posebook: ["全12しぐさの記録。いつの間に撮ったんだろう。", "sit"],
      observer: ["押せそうなものを全部押した人のバッジ。よい好奇心。", "point"]
    };
    const item = descriptions[id] || ["よく分からない。", "look"];
    say(item[0], item[1]);
    setInfoOpen(false, false);
  }

  function toast(message) {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    elements.toastRegion.append(node);
    window.setTimeout(() => node.remove(), 2900);
  }

  function openPuzzle(id) {
    window.clearTimeout(idleTimer);
    setInfoOpen(false, false);
    const puzzle = puzzles[id];
    activePuzzle = { id, puzzle, solved: false };
    elements.puzzleKicker.textContent = puzzle.kicker;
    elements.puzzleTitle.textContent = puzzle.title;
    elements.puzzleDetail.textContent = puzzle.detail;
    elements.puzzleFeedback.className = "feedback";
    elements.puzzleFeedback.textContent = puzzle.type === "text" ? "答えを入力してください。" : "答えを選んでください。";
    elements.puzzleContinueButton.hidden = true;
    elements.puzzleHintButton.hidden = false;
    elements.puzzleCloseButton.hidden = false;
    elements.choiceGrid.replaceChildren();
    elements.answerForm.hidden = puzzle.type !== "text";
    elements.choiceGrid.hidden = puzzle.type === "text";

    if (puzzle.type === "text") {
      elements.answerInput.value = "";
      elements.answerLabel.textContent = puzzle.inputLabel || "ひらがな・漢字、どちらでもOK";
      elements.answerInput.placeholder = puzzle.placeholder || "答えを入力";
      elements.answerInput.inputMode = puzzle.inputMode || "text";
    } else {
      puzzle.options.forEach(([letter, label]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice-button";
        button.innerHTML = '<span class="choice-letter">' + letter + "</span><span>" + label + "</span>";
        button.addEventListener("click", () => submitChoice(letter));
        elements.choiceGrid.append(button);
      });
    }

    elements.puzzleDialog.showModal();
    if (puzzle.type === "text") {
      window.setTimeout(() => elements.answerInput.focus(), 120);
    }
    playSound("open");
  }

  function submitChoice(letter) {
    if (!activePuzzle || activePuzzle.solved) return;
    const puzzle = activePuzzle.puzzle;
    const correct = puzzle.acceptAny || letter === puzzle.correct;
    if (correct) {
      solveActivePuzzle();
    } else {
      state.mistakes += 1;
      elements.puzzleFeedback.className = "feedback wrong";
      elements.puzzleFeedback.textContent = puzzle.wrong;
      playSound("wrong");
    }
  }

  function submitTextAnswer(event) {
    event.preventDefault();
    if (!activePuzzle || activePuzzle.solved) return;
    const puzzle = activePuzzle.puzzle;
    if (puzzle.validate(elements.answerInput.value)) {
      solveActivePuzzle();
    } else {
      state.mistakes += 1;
      elements.puzzleFeedback.className = "feedback wrong";
      elements.puzzleFeedback.textContent = puzzle.wrong;
      playSound("wrong");
    }
  }

  function solveActivePuzzle() {
    activePuzzle.solved = true;
    const puzzle = activePuzzle.puzzle;
    elements.puzzleFeedback.className = "feedback success";
    elements.puzzleFeedback.textContent = puzzle.success;
    elements.puzzleContinueButton.hidden = false;
    elements.puzzleHintButton.hidden = true;
    elements.puzzleCloseButton.hidden = true;
    elements.choiceGrid.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    elements.answerInput.disabled = true;
    elements.answerForm.querySelector("button").disabled = true;
    playSound("correct");
  }

  function continuePuzzle() {
    if (!activePuzzle?.solved) return;
    const completed = activePuzzle.puzzle;
    elements.puzzleDialog.close();
    elements.answerInput.disabled = false;
    elements.answerForm.querySelector("button").disabled = false;
    activePuzzle = null;
    completed.onComplete();
  }

  function closePuzzle() {
    if (activePuzzle?.solved) return;
    elements.puzzleDialog.close();
    elements.answerInput.disabled = false;
    elements.answerForm.querySelector("button").disabled = false;
    activePuzzle = null;
    scheduleIdle();
  }

  function showPuzzleHint() {
    if (!activePuzzle) return;
    state.hints += 1;
    elements.puzzleFeedback.className = "feedback";
    elements.puzzleFeedback.textContent = activePuzzle.puzzle.hint;
    playSound("hint");
  }

  function roomHint() {
    state.hints += 1;
    let text = "透明な箱をタップして、植物をよく見る。";
    if (state.plantSeen && !state.q1Done) text = "壁の黒いモニターが点灯している。";
    else if (state.q1Done && !state.battery) text = "机の中央にある引き出しが、少し開いている。";
    else if (state.battery && !state.batteryCharged) text = "机の左に小さな充電台がある。";
    else if (state.batteryCharged && !state.q3Done) text = "充電が終わると、モニターに新しい問題が出た。";
    else if (state.q3Done && !state.treeSolved) text = "壁から現れた木の数字を見比べる。";
    else if (state.treeSolved && !state.airSolved) text = "正面に落ちてきた、透明な袋を調べる。";
    else if (state.airSolved && !state.finalSolved) text = "木をもう一度タップして、最後の実験を始める。";
    else if (state.finalSolved) text = "扉の赤いランプが緑に変わっている。";
    setView(state.finalSolved ? "right" : "center", false);
    toast(text);
    playSound("hint");
    setInfoOpen(false, false);
  }

  function updateWindowGimmick() {
    const closed = state.windowClosed;
    elements.windowVeil.classList.toggle("closed", closed);
    elements.windowGimmickSpot.classList.toggle("closed", closed);
    elements.windowGimmickIcon.textContent = closed ? "○" : "◇";
    elements.windowGimmickLabel.textContent = closed ? "くもりガラス" : "光の模様";
    elements.windowGimmickSpot.setAttribute(
      "aria-label",
      closed ? "閉じた窓のくもりガラスを調べる" : "開いた窓から差す光の模様を調べる"
    );
  }

  function inspectWindow() {
    state.windowClosed = !state.windowClosed;
    state.windowToggles += 1;
    updateWindowGimmick();
    markDiscovery("window");
    if (state.windowClosed) {
      const message = state.windowToggles > 2
        ? "窓を閉めた。外の音が遠くなって、くもりガラスが目立つ。"
        : "ことん。窓を閉めたら、外の光がくもりガラスへ移った。別の模様が見えそう。";
      say(message, "pillow");
      showMechanism("☾", "窓を閉じた：仕掛けが切り替わった");
    } else {
      const message = state.windowToggles > 2
        ? "窓を開けた。床へ、細長い光がすべりこんだ。"
        : "からん。窓を開けると、日差しが床に模様を描いた。こっちも調べられそう。";
      say(message, "look");
      showMechanism("☼", "窓を開けた：仕掛けが切り替わった");
    }
    spawnParticles(state.windowClosed ? "☾" : "✦", 39, 40, 7);
    playSound("mechanism");
  }

  function inspectWindowGimmick() {
    if (state.windowClosed) {
      if (!state.windowDarkSeen) {
        state.windowDarkSeen = true;
        addClue("閉じた窓のくもりガラスに、数字の「2」が浮かぶ。");
        showMechanism("2", "暗い窓の数字：2");
        spawnParticles("2", 39, 42, 7);
        say("くもりを指でなぞると《2》。窓を閉じたときだけ見える数字みたい。", "point");
      } else {
        say("閉じた窓の数字は《2》。メニューの手がかりにも記録してある。", "stand");
      }
    } else if (!state.windowLightSeen) {
      state.windowLightSeen = true;
      addClue("開いた窓の光が、床に数字の「7」を描く。");
      showMechanism("7", "明るい窓の数字：7");
      spawnParticles("7", 39, 46, 7);
      say("差し込む光が、床で《7》の形になってる。窓を開けたときだけの数字。", "point");
    } else {
      say("開いた窓の光の数字は《7》。閉じると、別の仕掛けに変わる。", "look");
    }
    playSound("hint");
  }

  function inspectPipe() {
    state.pipeTurns += 1;
    elements.pipeSpot.style.setProperty("--turn", (state.pipeTurns * 90) + "deg");
    markDiscovery("pipe");
    if (state.pipeTurns === 2 && !state.valveNumberSeen) {
      state.valveNumberSeen = true;
      addClue("バルブを半回転すると、軸の刻印「9」が正面を向く。");
      say("もう一回きゅっ。軸に隠れていた刻印は《9》。数字まで配管されてた。", "point");
      showMechanism("9", "バルブの数字：9");
      spawnParticles("9", 65, 38, 7);
    } else if (state.pipeTurns % 4 === 0) {
      say("一周した。元の向きだけど、達成感だけは残った。", "buns");
      showMechanism("◎", "くるん。ちょうど一周");
      spawnParticles("○", 65, 38, 8);
    } else {
      say("きゅっ。壁のどこかで《ぷしゅ》と音がした。たぶん安全。", "tools");
      showMechanism("≈", "ぷしゅっ");
      spawnParticles("·", 65, 38, 7);
    }
    playSound("mechanism");
  }

  function inspectFloor() {
    state.floorTaps += 1;
    elements.floorSpot.classList.remove("bump");
    requestAnimationFrame(() => elements.floorSpot.classList.add("bump"));
    if (state.floorTaps < 3) {
      say(state.floorTaps === 1
        ? "ここだけ、床が少し浮いている。ぽこん。"
        : "もう一度。ぽこん。下に何かある気がする。", "sit");
      playSound("locked");
      return;
    }
    if (!state.discoveries.includes("floor")) {
      markDiscovery("floor");
      addInventory("screw", "✣", "ふしぎなネジ");
      showMechanism("✣", "床のすきまから、ころん");
      spawnParticles("✦", 61, 84, 9);
      say("三回目で、星みたいなネジが出てきた。使わなくても持っておこう。", "tools");
    } else {
      say("ぽこん。もうネジは出ないけど、この音はちょっと好き。", "sit");
    }
  }

  function inspectLight() {
    const modes = [
      ["warm", "あたたかい色。なんだか、まんじゅうがおいしく見える。", "buns", "☼"],
      ["mint", "ミント色。植物が少し得意げに見える。", "look", "✦"],
      ["night", "夜ふかし色。眠くなる仕掛けまでついている。", "sleep", "☾"]
    ];
    state.lightMode = (state.lightMode + 1) % modes.length;
    const [mode, message, pose, icon] = modes[state.lightMode];
    elements.stage.dataset.light = mode;
    markDiscovery("light");
    say(message, pose);
    showMechanism(icon, "照明モード：" + (mode === "warm" ? "ぽかぽか" : mode === "mint" ? "すっきり" : "うとうと"));
    spawnParticles(icon, 50, 16, 8);
    playSound("mechanism");
  }

  function inspectCeilingPanel() {
    state.ceilingTaps += 1;
    elements.ceilingPanelSpot.style.setProperty("--ceiling-turn", (state.ceilingTaps * 120) + "deg");
    if (state.ceilingTaps === 1) {
      say("天井の星形パネルが、かちっと三分の一だけ回った。見上げすぎてフードが落ちそう。", "look");
      showMechanism("✦", "天井パネル：1 / 3");
      spawnParticles("·", 48, 10, 5);
    } else if (state.ceilingTaps === 2) {
      say("もう一回。星の先が光って、あと一押しと言っている。たぶん。", "point");
      showMechanism("✦", "天井パネル：2 / 3");
      spawnParticles("✦", 48, 10, 6);
    } else if (!state.ceilingSeen) {
      state.ceilingSeen = true;
      elements.ceilingGlyph.hidden = false;
      elements.ceilingPanelSpot.classList.add("revealed");
      addClue("天井の星形パネルを3回動かすと、数字の「4」が光る。");
      say("三回目で、天井に《★ 4》。星のとがった先も、ちょうど四つ。", "buns");
      showMechanism("4", "天井の数字：4");
      spawnParticles("4", 50, 11, 9);
    } else {
      const messages = [
        "天井の星は《4》のまま。回しても、もう目は回らない。",
        "四つのとがり、数字も《4》。かなり素直な天井だった。",
        "上を向くたび、フードの耳が重力に負ける。数字は《4》。"
      ];
      say(randomPick(messages), "look");
      showMechanism("4", "天井の数字：4");
    }
    playSound("mechanism");
  }

  function inspectMemo() {
    if (!state.memoSeen) {
      state.memoSeen = true;
      addClue("番号メモの順番：暗い窓 → 天井の星 → バルブ → 明るい窓。");
      say("番号のメモ。《暗い窓 → 天井の星 → バルブ → 明るい窓》。数字は部屋で探すらしい。", "point");
      showMechanism("▱", "4桁の順番を記録した");
      spawnParticles("?", 67, 59, 6);
      playSound("item");
    } else {
      const missing = [
        !state.windowDarkSeen && "暗い窓",
        !state.ceilingSeen && "天井",
        !state.valveNumberSeen && "バルブ",
        !state.windowLightSeen && "明るい窓"
      ].filter(Boolean);
      say(missing.length
        ? "メモの順番は同じ。まだ調べていないのは《" + missing.join("・") + "》。"
        : "四つとも見つけた。メモの順に並べて、扉側の金庫へ。", missing.length ? "look" : "buns");
    }
  }

  function inspectLamp() {
    state.lampTaps += 1;
    elements.lampSpot.classList.remove("flash");
    requestAnimationFrame(() => elements.lampSpot.classList.add("flash"));
    markDiscovery("lamp");
    const messages = [
      "赤いランプ。押すと《ピ》とは言うけど、扉は開かない。",
      "《ピピ》二回押しても赤い。ランプの意思は固い。",
      "《ピピピ》ちょっとリズムがよくなってきた。"
    ];
    say(messages[Math.min(state.lampTaps - 1, messages.length - 1)], state.lampTaps === 1 ? "grumpy" : "point");
    spawnParticles("♪", 80, 15, 4);
    playSound("tap");
  }

  function inspectPanel() {
    state.panelTaps += 1;
    if (state.panelTaps === 1) {
      say("細いパネル。下のほうが、ほんの少しだけ浮いている。", "look");
      showMechanism("▤", "あと一押しで開きそう");
      playSound("locked");
      return;
    }
    if (!state.discoveries.includes("panel")) {
      elements.panelSpot.classList.add("opened");
      markDiscovery("panel");
      addInventory("manju", "◉", "非常用まんじゅう");
      say("ぱかっ。非常用まんじゅう発見。脱出に不要なものほど、うれしい。", "buns");
      showMechanism("◉", "非常用おやつ、確保！");
      spawnParticles("♡", 37, 37, 9);
      playSound("item");
    } else {
      say("パネルの中は空っぽ。まんじゅうは一個だけだった。", "grumpy");
    }
  }

  function inspectHatch() {
    state.hatchOpen = !state.hatchOpen;
    elements.hatchSpot.classList.toggle("opened", state.hatchOpen);
    markDiscovery("hatch");
    if (state.hatchOpen) {
      say("ぱたん。黒い猫の手が、ぬっと出てきて引っ込んだ。仲間かな。", "cat");
      showMechanism("🐾", "ねこの手だけ、出演");
      spawnParticles("🐾", 87, 67, 6);
    } else {
      say("小さな穴を閉じた。向こうから《にゃ》と抗議された気がする。", "startled");
      showMechanism("◒", "ぱたん");
    }
    playSound("mechanism");
  }

  function inspectSafe() {
    if (state.safeOpened) {
      say("金庫は開いている。残っているのは、クッキーのいい匂いだけ。", "buns");
      return;
    }
    openPuzzle("safe");
  }

  function inspectIntercom() {
    const messages = [
      ["《こちらROOM 0受付。ご用件は、1なら脱出、2ならおやつ》……番号ボタンは一個しかない。", "startled"],
      ["《ただいま全員、空気中です》って返事がきた。哲学的な留守電。", "look"],
      ["《窓は開けたり閉めたりしてください》はい。もう、そのつもりです。", "point"],
      ["《天井を三回》……そこで通信が切れた。大事なところは聞こえた。", "tools"],
      ["《金庫のおやつは一人一個まで》まだ開けてないのに、内容だけ知ってる。", "grumpy"],
      ["……今度は黒猫の《にゃ》だけ。隣の小さな穴とつながってる？", "cat"]
    ];
    const [message, pose] = messages[state.intercomTaps % messages.length];
    state.intercomTaps += 1;
    say(message, pose, "インターホン");
    showMechanism("♪", "ぷつっ……応答あり");
    spawnParticles("♪", 85, 38, 5);
    playSound("tap");
  }

  function inspectTerrarium() {
    if (!state.plantSeen) {
      state.plantSeen = true;
      markDiscovery("plant");
      elements.terrariumSpot.classList.add("done");
      setObjective("点灯したモニターを見る", 0);
      say("土と水と空気、それから小さな植物。ガラスの箱はぴったり閉じている。", "look");
      window.setTimeout(() => toast("モニターが点灯した"), 450);
      playSound("item");
    } else {
      say("葉っぱは元気。外から入っているのは、天井の光だけみたいだ。", "stand");
    }
  }

  function inspectMonitor() {
    if (!state.plantSeen) {
      say("《先に透明な箱を確認してください》……順番に厳しい。", "grumpy", "モニター");
      return;
    }
    if (!state.q1Done) openPuzzle("q1");
    else if (!state.battery) say("《机の内部を確認してください》引き出しのことかな。", "look", "モニター");
    else if (!state.batteryCharged) say("《電源が不足しています》バッテリーを充電台へ置け、と。", "grumpy", "モニター");
    else if (!state.q3Done) openPuzzle("q3");
    else say("モニターには《TREE TEST》と出ている。木を調べよう。", "point");
  }

  function inspectDrawer() {
    if (!state.q1Done) return;
    if (!state.battery) {
      state.battery = true;
      elements.drawerSpot.classList.add("done");
      elements.chargerSpot.disabled = false;
      addInventory("battery", "▱", "空のバッテリー");
      setObjective("バッテリーを充電台に置く", 2);
      say("空っぽのバッテリーが入っていた。工具はあるけど、ここで分解はやめておこう。", "tools");
    } else {
      say("引き出しは空。二重底も……たぶんない。", "look");
    }
  }

  function inspectCharger() {
    if (!state.battery) {
      say("小さな充電台。いまは置くものがない。", "look");
      return;
    }
    if (!state.batteryCharged) openPuzzle("q2");
    else say("充電完了。ランプがほこらしげに光っている。", "stand");
  }

  function inspectTree() {
    if (!state.q3Done) return;
    if (!state.treeSolved) {
      openPuzzle("q4");
    } else if (!state.airSolved) {
      say("木の材料は空気から来た。次は、透明な袋を調べる番。", "point");
    } else if (!state.finalSolved) {
      if (elements.treeObject.classList.contains("burning")) return;
      elements.treeObject.classList.add("burning");
      say("燃焼シミュレーター、開始。……本物の火じゃないよね？", "cat");
      playSound("burn");
      window.setTimeout(() => openPuzzle("final"), 1850);
    } else {
      say("残ったのは少量の灰。木の多くは気体になって、部屋の空気へ戻った。", "stand");
    }
  }

  function inspectAir() {
    if (!state.treeSolved) return;
    if (!state.airSolved) openPuzzle("q5");
    else say("1 m³で約1.2 kg。空気、思ったよりしっかりいる。", "look");
  }

  function inspectDoor() {
    if (!state.finalSolved) {
      say("赤いランプ。《LOCKED》押しても引いても、びくともしない。", "grumpy");
      playSound("locked");
      return;
    }
    window.clearTimeout(idleTimer);
    setInfoOpen(false, false);
    stopBgm();
    playSound("unlock");
    elements.gameApp.inert = true;
    elements.clearScreen.hidden = false;
    elements.clearScreen.querySelector("button").focus();
  }

  function startGame() {
    state.started = true;
    elements.startScreen.hidden = true;
    elements.gameApp.inert = false;
    setInfoOpen(false, false);
    setView("center", false);
    say("白い部屋。左右も見回せそう。まずは、透明な箱が気になる。", "stand");
    elements.terrariumSpot.focus();
    playSound("start");
    startBgm();
  }

  function resetGame(confirmFirst = true) {
    if (confirmFirst && state.started && !window.confirm("最初からやり直しますか？")) return;
    const keepSound = state.sound;
    stopBgm();
    window.clearTimeout(idleTimer);
    window.clearTimeout(poseTimer);
    window.clearTimeout(mechanismTimer);
    window.clearTimeout(dialogueTimer);
    state = initialState();
    state.sound = keepSound;
    pointerStart = null;
    lastRandomMessage = "";
    activePuzzle = null;
    if (elements.puzzleDialog.open) elements.puzzleDialog.close();
    elements.clearScreen.hidden = true;
    elements.startScreen.hidden = false;
    elements.gameApp.inert = true;
    elements.monitorSpot.classList.remove("done");
    elements.terrariumSpot.classList.remove("done");
    elements.drawerSpot.classList.remove("done");
    elements.chargerSpot.classList.remove("done");
    elements.doorSpot.classList.remove("unlocked");
    elements.windowGimmickSpot.classList.remove("closed");
    elements.pipeSpot.style.removeProperty("--turn");
    elements.floorSpot.classList.remove("bump");
    elements.ceilingPanelSpot.style.removeProperty("--ceiling-turn");
    elements.ceilingPanelSpot.classList.remove("revealed");
    elements.ceilingGlyph.hidden = true;
    elements.lampSpot.classList.remove("flash");
    elements.panelSpot.classList.remove("opened");
    elements.hatchSpot.classList.remove("opened");
    elements.safeSpot.classList.remove("opened", "done");
    elements.mechanismCard.hidden = true;
    elements.mechanismCard.classList.remove("show");
    elements.particleLayer.replaceChildren();
    elements.swipeHint.classList.remove("dismissed");
    elements.discoveryCount.textContent = "0 / 8";
    elements.stage.dataset.light = "warm";
    updateWindowGimmick();
    setInfoOpen(false, false);
    elements.dialogueStrip.classList.remove("is-hidden");
    elements.dialogueStrip.setAttribute("aria-hidden", "false");
    elements.dialogueBody.tabIndex = 0;
    elements.drawerSpot.disabled = true;
    elements.chargerSpot.disabled = true;
    elements.treeObject.hidden = true;
    elements.treeObject.className = "scene-object tree-object view-only view-center";
    elements.airObject.hidden = true;
    elements.airObject.className = "scene-object air-object view-only view-center";
    elements.inventory.innerHTML = '<p class="empty-inventory">ポケットは、みごとに空っぽ。</p>';
    elements.clueList.innerHTML = "<li>まだ何もわかっていない。</li>";
    elements.dialogueName.textContent = "わたし";
    elements.dialogueText.textContent = "白い部屋。扉には赤いランプ。まずは、透明な箱が気になる。";
    setView("center", false);
    setPose("sleep");
    setObjective("透明な箱を調べる", 0);
    elements.startButton.focus();
  }

  function syncSoundUi() {
    elements.soundButton.setAttribute("aria-pressed", String(state.sound));
    elements.soundButton.setAttribute("aria-label", state.sound ? "BGMと効果音をオフにする" : "BGMと効果音をオンにする");
    elements.soundButton.querySelector(".button-label").textContent = state.sound ? "音あり" : "音なし";
    elements.soundButton.querySelector("[aria-hidden='true']").textContent = state.sound ? "♪" : "×";
    elements.drawerSoundButton.textContent = state.sound ? "♪ BGM・効果音あり" : "× BGM・効果音なし";
    elements.drawerSoundButton.setAttribute("aria-pressed", String(state.sound));
  }

  function getAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") {
      void audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  function startBgm() {
    if (!state.sound || !state.started || !elements.clearScreen.hidden || document.hidden) return;
    elements.bgmAudio.volume = .32;
    if (!elements.bgmAudio.paused) return;
    void elements.bgmAudio.play().catch(() => {});
  }

  function stopBgm() {
    elements.bgmAudio.pause();
  }

  function toggleSound() {
    state.sound = !state.sound;
    syncSoundUi();
    if (state.sound) {
      playSound("item");
      startBgm();
    } else {
      stopBgm();
    }
  }

  function playSound(kind) {
    if (!state.sound) return;
    try {
      const context = getAudioContext();
      if (!context) return;
      const now = context.currentTime;
      const gain = context.createGain();
      gain.connect(context.destination);
      const patterns = {
        start: [[392, .00, .07], [523, .09, .12]],
        open: [[440, .00, .05]],
        item: [[659, .00, .06], [784, .07, .08]],
        hint: [[440, .00, .05], [554, .07, .06]],
        move: [[294, .00, .045], [349, .055, .045]],
        tap: [[740, .00, .035], [880, .045, .05]],
        mechanism: [[330, .00, .05], [494, .06, .06], [659, .13, .08]],
        correct: [[523, .00, .07], [659, .08, .07], [784, .16, .14]],
        wrong: [[220, .00, .09], [185, .10, .12]],
        locked: [[150, .00, .05], [130, .08, .08]],
        unlock: [[392, .00, .07], [523, .08, .07], [659, .16, .07], [1047, .24, .18]],
        burn: [[160, .00, .12], [130, .13, .16]]
      };
      (patterns[kind] || patterns.open).forEach(([frequency, delay, duration]) => {
        const oscillator = context.createOscillator();
        oscillator.type = kind === "wrong" || kind === "locked" ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        gain.gain.setValueAtTime(.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(.075, now + delay + .015);
        gain.gain.exponentialRampToValueAtTime(.0001, now + delay + duration);
        oscillator.start(now + delay);
        oscillator.stop(now + delay + duration + .03);
      });
    } catch (_) {
      state.sound = false;
      syncSoundUi();
      stopBgm();
    }
  }

  function readGameStatus() {
    return {
      started: state.started,
      view: state.view,
      objective: elements.objectiveText.textContent,
      progress: state.finalSolved ? 6
        : state.airSolved ? 5
          : state.q3Done ? 4
            : state.batteryCharged ? 3
              : state.battery ? 2
                : state.q1Done ? 1 : 0,
      inventory: [...elements.inventory.querySelectorAll(".item-name")].map((node) => node.textContent),
      clues: [...state.clues],
      discoveries: [...state.discoveries],
      discoveryCount: state.discoveries.length,
      numberPuzzle: {
        memoSeen: state.memoSeen,
        darkWindowSeen: state.windowDarkSeen,
        ceilingSeen: state.ceilingSeen,
        valveSeen: state.valveNumberSeen,
        lightWindowSeen: state.windowLightSeen,
        safeOpened: state.safeOpened
      },
      seenPoses: [...state.seenPoses],
      puzzle: activePuzzle ? {
        id: activePuzzle.id,
        title: activePuzzle.puzzle.title,
        type: activePuzzle.puzzle.type || "choice",
        options: activePuzzle.puzzle.options
          ? activePuzzle.puzzle.options.map(([key, label]) => ({ key, label }))
          : []
      } : null,
      cleared: state.finalSolved
    };
  }

  function registerWebMcpTools() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool) => {
      try {
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {});
      } catch (_) {
        // Unsupported implementations should not affect the visible game.
      }
    };

    register({
      name: "read_room_zero_status",
      title: "Read ROOM 0 status",
      description: "Read the current view, objective, inventory, discoveries, character poses, active puzzle, and clear state without changing the game.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        return readGameStatus();
      }
    });

    register({
      name: "inspect_room_zero_object",
      title: "Inspect an object in ROOM 0",
      description: "Inspect one visible room object using the same action as tapping it in the game.",
      inputSchema: {
        type: "object",
        properties: {
          object: {
            type: "string",
            enum: [
              "window", "window_gimmick", "pipe", "floor", "terrarium", "monitor", "drawer", "charger",
              "light", "ceiling_panel", "number_memo", "tree", "air_bag", "door", "lamp", "panel",
              "hatch", "safe", "intercom", "character"
            ]
          }
        },
        required: ["object"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        if (!input || typeof input.object !== "string") throw new Error("object is required");
        const actions = {
          window: inspectWindow,
          window_gimmick: inspectWindowGimmick,
          pipe: inspectPipe,
          floor: inspectFloor,
          terrarium: inspectTerrarium,
          monitor: inspectMonitor,
          drawer: inspectDrawer,
          charger: inspectCharger,
          light: inspectLight,
          ceiling_panel: inspectCeilingPanel,
          number_memo: inspectMemo,
          tree: inspectTree,
          air_bag: inspectAir,
          door: inspectDoor,
          lamp: inspectLamp,
          panel: inspectPanel,
          hatch: inspectHatch,
          safe: inspectSafe,
          intercom: inspectIntercom,
          character: tapAvatar
        };
        const objectViews = {
          window: "left", window_gimmick: "left", pipe: "left", floor: "left",
          terrarium: "center", monitor: "center", drawer: "center", charger: "center",
          light: "center", ceiling_panel: "center", number_memo: "center", tree: "center", air_bag: "center",
          door: "right", lamp: "right", panel: "right", hatch: "right", safe: "right", intercom: "right"
        };
        const action = actions[input.object];
        if (!action) throw new Error("unknown object");
        if (!state.started) startGame();
        if (objectViews[input.object]) setView(objectViews[input.object], false);
        const waitsForBurn = input.object === "tree" && state.airSolved && !state.finalSolved;
        action();
        if (waitsForBurn) {
          await new Promise((resolve) => window.setTimeout(resolve, 1900));
        }
        return readGameStatus();
      }
    });

    register({
      name: "look_room_zero_direction",
      title: "Look around ROOM 0",
      description: "Turn toward the window side, the center desk, or the exit-door side.",
      inputSchema: {
        type: "object",
        properties: {
          direction: { type: "string", enum: ["left", "center", "right"] }
        },
        required: ["direction"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || !VIEWS.some((view) => view.id === input.direction)) throw new Error("valid direction is required");
        if (!state.started) startGame();
        setView(input.direction);
        return readGameStatus();
      }
    });

    register({
      name: "answer_room_zero_puzzle",
      title: "Answer the active ROOM 0 puzzle",
      description: "Submit one answer to the currently open EXIT TEST and advance when it is correct.",
      inputSchema: {
        type: "object",
        properties: {
          answer: { type: "string", minLength: 1 }
        },
        required: ["answer"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!activePuzzle || activePuzzle.solved) throw new Error("no unanswered puzzle is open");
        if (!input || typeof input.answer !== "string" || !input.answer.trim()) throw new Error("answer is required");
        const puzzleBefore = activePuzzle;
        if (puzzleBefore.puzzle.type === "text") {
          elements.answerInput.value = input.answer;
          submitTextAnswer({ preventDefault() {} });
        } else {
          const raw = input.answer.trim();
          const matching = puzzleBefore.puzzle.options.find(([key, label]) =>
            key.toLowerCase() === raw.toLowerCase() || label === raw
          );
          if (!matching) throw new Error("answer must match a choice key or label");
          submitChoice(matching[0]);
        }
        const correct = Boolean(activePuzzle?.solved);
        if (correct) continuePuzzle();
        return { correct, status: readGameStatus() };
      }
    });
  }

  function beginSwipe(event) {
    if (event.target.closest("button, input, a")) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  function finishSwipe(event) {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    turnView(deltaX < 0 ? 1 : -1);
  }

  function handleRoomKey(event) {
    if (event.key === "Escape" && elements.gameApp.classList.contains("info-open")) {
      event.preventDefault();
      setInfoOpen(false);
      return;
    }
    if (!state.started || elements.puzzleDialog.open || !elements.clearScreen.hidden) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      turnView(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      turnView(1);
    }
  }

  elements.startButton.addEventListener("click", startGame);
  elements.playAgainButton.addEventListener("click", () => resetGame(false));
  elements.resetButton.addEventListener("click", () => resetGame(true));
  elements.soundButton.addEventListener("click", toggleSound);
  elements.drawerSoundButton.addEventListener("click", toggleSound);
  elements.drawerResetButton.addEventListener("click", () => resetGame(true));
  elements.infoMenuButton.addEventListener("click", () => setInfoOpen(!elements.gameApp.classList.contains("info-open")));
  elements.infoCloseButton.addEventListener("click", () => setInfoOpen(false));
  elements.infoBackdrop.addEventListener("click", () => setInfoOpen(false));
  elements.dialogueCloseButton.addEventListener("click", hideDialogue);
  elements.dialogueBody.addEventListener("click", hideDialogue);
  elements.dialogueBody.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      hideDialogue();
    }
  });
  elements.roomHintButton.addEventListener("click", roomHint);
  elements.turnLeftButton.addEventListener("click", () => turnView(-1));
  elements.turnRightButton.addEventListener("click", () => turnView(1));
  elements.windowSpot.addEventListener("click", inspectWindow);
  elements.windowGimmickSpot.addEventListener("click", inspectWindowGimmick);
  elements.pipeSpot.addEventListener("click", inspectPipe);
  elements.floorSpot.addEventListener("click", inspectFloor);
  elements.terrariumSpot.addEventListener("click", inspectTerrarium);
  elements.monitorSpot.addEventListener("click", inspectMonitor);
  elements.drawerSpot.addEventListener("click", inspectDrawer);
  elements.chargerSpot.addEventListener("click", inspectCharger);
  elements.lightSpot.addEventListener("click", inspectLight);
  elements.ceilingPanelSpot.addEventListener("click", inspectCeilingPanel);
  elements.memoSpot.addEventListener("click", inspectMemo);
  elements.treeObject.addEventListener("click", inspectTree);
  elements.airObject.addEventListener("click", inspectAir);
  elements.doorSpot.addEventListener("click", inspectDoor);
  elements.lampSpot.addEventListener("click", inspectLamp);
  elements.panelSpot.addEventListener("click", inspectPanel);
  elements.hatchSpot.addEventListener("click", inspectHatch);
  elements.safeSpot.addEventListener("click", inspectSafe);
  elements.intercomSpot.addEventListener("click", inspectIntercom);
  elements.avatarFrame.addEventListener("click", tapAvatar);
  elements.stage.addEventListener("pointerdown", beginSwipe);
  elements.stage.addEventListener("pointerup", finishSwipe);
  elements.stage.addEventListener("pointercancel", () => { pointerStart = null; });
  elements.gameApp.addEventListener("pointerdown", scheduleIdle, { passive: true });
  document.addEventListener("keydown", handleRoomKey);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopBgm();
    else startBgm();
  });
  elements.puzzleHintButton.addEventListener("click", showPuzzleHint);
  elements.puzzleCloseButton.addEventListener("click", closePuzzle);
  elements.puzzleContinueButton.addEventListener("click", continuePuzzle);
  elements.answerForm.addEventListener("submit", submitTextAnswer);
  elements.puzzleDialog.addEventListener("cancel", (event) => {
    if (activePuzzle?.solved) event.preventDefault();
    else {
      activePuzzle = null;
      scheduleIdle();
    }
  });

  drawerMedia.addEventListener("change", syncResponsiveUi);
  compactLandscapeMedia.addEventListener("change", syncResponsiveUi);

  initProgress();
  preloadPoseImages();
  syncSoundUi();
  setObjective("透明な箱を調べる", 0);
  syncResponsiveUi();
  registerWebMcpTools();
})();
