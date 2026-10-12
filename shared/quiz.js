export const QUIZ_VERSION = "1.0.0";

export const dimensions = [
  { key: "drive", name: "行动意愿", left: "从容酝酿", right: "主动推进" },
  { key: "insight", name: "内在洞察", left: "相信经验", right: "留意深意" },
  { key: "freedom", name: "自主边界", left: "共同决定", right: "自主选择" },
  { key: "empathy", name: "关系感知", left: "先看事实", right: "体察感受" },
  { key: "order", name: "秩序偏好", left: "弹性应变", right: "清晰规划" },
  { key: "exploration", name: "探索倾向", left: "熟悉安心", right: "拥抱未知" },
  { key: "resilience", name: "自我调适", left: "认真感受", right: "寻找转机" },
  { key: "expression", name: "表达意愿", left: "留给自己", right: "让人看见" },
];

const option = (text, traits, cards) => ({ text, traits, cards });
const question = (id, chapter, text, context, options) => ({
  id,
  chapter,
  text,
  context,
  options,
});

export const questions = [
  question(
    1,
    "选择与行动",
    "突然多出一天完全属于你的时间，你更想怎么过？",
    "没有工作，也没有必须完成的安排。",
    [
      option(
        "去一个没去过的地方，边走边决定。",
        { exploration: 3, freedom: 2, drive: 1 },
        [0, 7, 10],
      ),
      option(
        "把一直想做的事真正动手做出来。",
        { drive: 3, expression: 2, order: 1 },
        [1, 19, 4],
      ),
      option(
        "关掉消息，让自己安静地待一会儿。",
        { insight: 3, freedom: 2, resilience: 1 },
        [9, 2, 12],
      ),
      option(
        "约重要的人，共享一段舒服的时光。",
        { empathy: 3, expression: 2, resilience: 1 },
        [3, 6, 14],
      ),
    ],
  ),
  question(
    2,
    "选择与行动",
    "一个大家都期待的计划迟迟没有进展，你通常会？",
    "你也在其中，但没有人明确负责。",
    [
      option(
        "先做一个小版本，让事情开始转起来。",
        { drive: 3, exploration: 2, expression: 1 },
        [1, 7, 0],
      ),
      option(
        "厘清卡点和分工，再推动大家执行。",
        { order: 3, drive: 2, resilience: 1 },
        [4, 11, 5],
      ),
      option(
        "听听各自的顾虑，找到都能接受的办法。",
        { empathy: 3, resilience: 2, insight: 1 },
        [14, 8, 6],
      ),
      option(
        "重新问一句：我们真的还需要这个计划吗？",
        { insight: 3, freedom: 2, exploration: 1 },
        [13, 16, 20],
      ),
    ],
  ),
  question(
    3,
    "选择与行动",
    "面对一个不错但并不熟悉的机会，你最想先确认什么？",
    "它可能改变你接下来半年的生活。",
    [
      option(
        "我能获得多大的空间与新的体验。",
        { exploration: 3, freedom: 2, drive: 1 },
        [0, 10, 21],
      ),
      option(
        "投入、规则和结果是否足够清楚。",
        { order: 3, insight: 2, drive: 1 },
        [11, 4, 5],
      ),
      option(
        "我是否真的喜欢，而不是只觉得应该。",
        { insight: 3, freedom: 2, empathy: 1 },
        [2, 6, 9],
      ),
      option(
        "它能否让我靠近一直想成为的自己。",
        { drive: 3, resilience: 2, expression: 1 },
        [20, 17, 7],
      ),
    ],
  ),
  question(
    4,
    "选择与行动",
    "只能保留一句别人对你的评价，你会选哪一句？",
    "凭直觉选，不必考虑哪句听起来更优秀。",
    [
      option(
        "你总能把想法变成真实的东西。",
        { drive: 3, expression: 2, order: 1 },
        [1, 4, 7],
      ),
      option(
        "跟你在一起，我可以放松地做自己。",
        { empathy: 3, resilience: 2, expression: 1 },
        [3, 8, 19],
      ),
      option(
        "你有自己的世界，不轻易随波逐流。",
        { freedom: 3, insight: 2, exploration: 1 },
        [9, 2, 0],
      ),
      option(
        "你经历过很多，却还愿意相信可能。",
        { resilience: 3, exploration: 2, insight: 1 },
        [17, 10, 21],
      ),
    ],
  ),
  question(
    5,
    "关系与边界",
    "朋友临时取消了你很期待的见面，你更接近哪种反应？",
    "对方解释说，今天实在有些撑不住。",
    [
      option(
        "理解他的状态，问问有没有需要帮忙的。",
        { empathy: 3, resilience: 2, insight: 1 },
        [3, 8, 14],
      ),
      option(
        "有些失落，但会直接约定新的时间。",
        { order: 3, expression: 2, drive: 1 },
        [11, 4, 6],
      ),
      option(
        "把空出的时间留给自己，重新安排一天。",
        { freedom: 3, exploration: 2, resilience: 1 },
        [0, 9, 10],
      ),
      option(
        "先独处一下，分辨自己在意的究竟是什么。",
        { insight: 3, empathy: 2, freedom: 1 },
        [18, 2, 12],
      ),
    ],
  ),
  question(
    6,
    "关系与边界",
    "你更容易被哪一种亲近打动？",
    "这里的亲近可以来自朋友、家人或恋人。",
    [
      option(
        "对方能听懂我没有完全说出口的部分。",
        { insight: 3, empathy: 2, freedom: 1 },
        [2, 18, 9],
      ),
      option(
        "在重要的时刻，他明确站在我这一边。",
        { empathy: 3, expression: 2, resilience: 1 },
        [6, 8, 17],
      ),
      option(
        "我们一起把生活过得具体、稳定、有温度。",
        { order: 3, empathy: 2, resilience: 1 },
        [3, 5, 14],
      ),
      option(
        "彼此有吸引力，也允许各自自由生长。",
        { freedom: 3, exploration: 2, expression: 1 },
        [15, 0, 21],
      ),
    ],
  ),
  question(
    7,
    "关系与边界",
    "别人不断向你提出额外请求，你更可能？",
    "这些请求已经开始挤占你的休息。",
    [
      option(
        "把能做和不能做的部分讲清楚。",
        { order: 3, freedom: 2, expression: 1 },
        [11, 4, 8],
      ),
      option(
        "先照顾眼前的情绪，再慢慢调整距离。",
        { empathy: 3, insight: 2, resilience: 1 },
        [14, 3, 12],
      ),
      option(
        "问问自己，为什么总觉得拒绝会失去关系。",
        { insight: 3, freedom: 2, empathy: 1 },
        [18, 15, 2],
      ),
      option(
        "结束这个惯性，给自己的生活重新排优先级。",
        { freedom: 3, drive: 2, resilience: 1 },
        [13, 20, 16],
      ),
    ],
  ),
  question(
    8,
    "关系与边界",
    "在一段重要关系里，你最不想丢失什么？",
    "四样都重要，请选最难让步的一样。",
    [
      option(
        "真实的心动，以及主动选择彼此的感觉。",
        { empathy: 3, expression: 2, exploration: 1 },
        [6, 15, 19],
      ),
      option(
        "独处的空间，以及保留自我的自由。",
        { freedom: 3, insight: 2, exploration: 1 },
        [9, 0, 2],
      ),
      option(
        "说到做到，以及能共同遵守的承诺。",
        { order: 3, resilience: 2, empathy: 1 },
        [5, 11, 4],
      ),
      option(
        "彼此改变之后，仍能重新理解对方。",
        { resilience: 3, empathy: 2, insight: 1 },
        [14, 21, 17],
      ),
    ],
  ),
  question(
    9,
    "内在与感知",
    "进入一间陌生的房间，你通常先注意到什么？",
    "没有标准答案，只是你习惯的观察方式。",
    [
      option(
        "人们的表情，以及空气里微妙的气氛。",
        { insight: 3, empathy: 2, resilience: 1 },
        [18, 2, 6],
      ),
      option(
        "空间的布局、细节和美感。",
        { empathy: 3, expression: 2, exploration: 1 },
        [3, 17, 21],
      ),
      option(
        "这里正在发生什么，我可以参与什么。",
        { drive: 3, expression: 2, exploration: 1 },
        [19, 1, 7],
      ),
      option(
        "规则是什么，哪里能让我舒服地待着。",
        { order: 3, freedom: 2, insight: 1 },
        [5, 9, 4],
      ),
    ],
  ),
  question(
    10,
    "内在与感知",
    "一个念头在你心里盘旋很久，你通常怎么弄明白它？",
    "它不一定是烦恼，也可能是模糊的愿望。",
    [
      option(
        "写下来、查资料，把它的来龙去脉理清。",
        { insight: 3, order: 2, freedom: 1 },
        [9, 11, 5],
      ),
      option(
        "跟信任的人聊，听见自己的真实感受。",
        { empathy: 3, expression: 2, insight: 1 },
        [6, 3, 14],
      ),
      option(
        "换个环境，等待某个瞬间突然想通。",
        { exploration: 3, insight: 2, resilience: 1 },
        [12, 2, 10],
      ),
      option(
        "做一件与它有关的小事，让现实给反馈。",
        { drive: 3, exploration: 2, resilience: 1 },
        [1, 20, 7],
      ),
    ],
  ),
  question(
    11,
    "内在与感知",
    "当直觉和现有证据暂时不一致，你更倾向？",
    "这件事没有需要立刻作出的决定。",
    [
      option(
        "再观察一阵，直觉也许捕捉到了遗漏的细节。",
        { insight: 3, empathy: 2, freedom: 1 },
        [2, 18, 12],
      ),
      option(
        "先按可靠证据行动，同时保留修正空间。",
        { order: 3, drive: 2, resilience: 1 },
        [11, 4, 14],
      ),
      option(
        "设计一个小尝试，让两种判断都接受检验。",
        { exploration: 3, drive: 2, insight: 1 },
        [1, 10, 0],
      ),
      option(
        "确认这是否涉及我的底线，再决定是否参与。",
        { freedom: 3, order: 2, resilience: 1 },
        [8, 5, 20],
      ),
    ],
  ),
  question(
    12,
    "内在与感知",
    "你反复翻看的内容，通常带给你什么？",
    "想想你收藏夹里真正舍不得删掉的东西。",
    [
      option(
        "一个出口，让我相信生活还有另一种可能。",
        { exploration: 3, resilience: 2, freedom: 1 },
        [17, 0, 10],
      ),
      option(
        "一种被理解的感觉，有人说出了我的心事。",
        { empathy: 3, insight: 2, expression: 1 },
        [18, 6, 3],
      ),
      option(
        "一些可以使用的方法，让事情更有把握。",
        { order: 3, drive: 2, insight: 1 },
        [5, 1, 4],
      ),
      option(
        "更大的视角，帮我重新理解自己走过的路。",
        { insight: 3, resilience: 2, freedom: 1 },
        [9, 20, 21],
      ),
    ],
  ),
  question(
    13,
    "秩序与变化",
    "一个用了很久的方法开始失效，你会先？",
    "继续照旧也可以，但越来越费力。",
    [
      option(
        "拆开重做，旧方法已经完成了它的任务。",
        { drive: 3, freedom: 2, exploration: 1 },
        [16, 13, 1],
      ),
      option(
        "保留有效部分，逐步调整到新的平衡。",
        { resilience: 3, order: 2, empathy: 1 },
        [14, 8, 21],
      ),
      option(
        "寻找变化的规律，看时机正在往哪里走。",
        { insight: 3, exploration: 2, resilience: 1 },
        [10, 2, 12],
      ),
      option(
        "先确认最重要的原则，避免调整时失去方向。",
        { order: 3, insight: 2, freedom: 1 },
        [5, 11, 4],
      ),
    ],
  ),
  question(
    14,
    "秩序与变化",
    "计划被意外打乱时，什么最能让你重新站稳？",
    "请选最像你的第一反应。",
    [
      option(
        "立刻列出眼前还能做的几件事。",
        { drive: 3, order: 2, resilience: 1 },
        [7, 4, 1],
      ),
      option(
        "接受它已经发生，看看出现了什么新路。",
        { exploration: 3, resilience: 2, freedom: 1 },
        [10, 0, 13],
      ),
      option(
        "先安顿感受，等内心不再那么紧绷。",
        { empathy: 3, insight: 2, resilience: 1 },
        [8, 17, 18],
      ),
      option(
        "退后一步，重新理解这件事的位置。",
        { insight: 3, resilience: 2, order: 1 },
        [12, 9, 21],
      ),
    ],
  ),
  question(
    15,
    "秩序与变化",
    "一段经历已经结束，但你还保留着相关东西，你更可能？",
    "比如聊天记录、旧物或曾经做过的计划。",
    [
      option(
        "认真收好，它们见证了我如何走到今天。",
        { empathy: 3, insight: 2, order: 1 },
        [3, 18, 5],
      ),
      option(
        "留下少数重要的，其余让它们过去。",
        { resilience: 3, freedom: 2, order: 1 },
        [13, 14, 21],
      ),
      option(
        "暂时不动，等自己真正准备好再处理。",
        { insight: 3, empathy: 2, resilience: 1 },
        [12, 2, 8],
      ),
      option(
        "做一个明确的告别，给新生活腾出位置。",
        { drive: 3, freedom: 2, expression: 1 },
        [20, 16, 0],
      ),
    ],
  ),
  question(
    16,
    "秩序与变化",
    "你更愿意住在哪一种生活里？",
    "假设基本生活条件都能得到保障。",
    [
      option(
        "有清晰节奏，重要的人和事都有位置。",
        { order: 3, empathy: 2, resilience: 1 },
        [4, 5, 3],
      ),
      option(
        "变化很多，能不断遇见不同的自己。",
        { exploration: 3, freedom: 2, expression: 1 },
        [0, 10, 7],
      ),
      option(
        "留白足够，有时间深入自己的世界。",
        { insight: 3, freedom: 2, order: 1 },
        [9, 2, 12],
      ),
      option(
        "工作、关系和兴趣可以彼此滋养。",
        { resilience: 3, empathy: 2, expression: 1 },
        [21, 14, 19],
      ),
    ],
  ),
  question(
    17,
    "欲望与力量",
    "哪一种瞬间最容易让你觉得“这就是活着”？",
    "选择你真正向往的感受。",
    [
      option(
        "跨过一个难关，确认自己真的做到了。",
        { drive: 3, resilience: 2, expression: 1 },
        [7, 8, 20],
      ),
      option(
        "心动、创作或投入到忘记时间的体验。",
        { expression: 3, exploration: 2, empathy: 1 },
        [15, 6, 19],
      ),
      option(
        "突然理解一件事，内心变得清楚而安静。",
        { insight: 3, freedom: 2, resilience: 1 },
        [9, 2, 12],
      ),
      option(
        "意识到生活虽然普通，却完整地属于自己。",
        { resilience: 3, empathy: 2, order: 1 },
        [21, 3, 17],
      ),
    ],
  ),
  question(
    18,
    "欲望与力量",
    "努力很久却暂时没人看见，你更可能？",
    "这里说的是你真的在乎的事情。",
    [
      option(
        "调整表达，让价值更容易被别人理解。",
        { expression: 3, drive: 2, order: 1 },
        [1, 19, 4],
      ),
      option(
        "确认自己还想不想做，答案比掌声重要。",
        { freedom: 3, insight: 2, resilience: 1 },
        [9, 2, 20],
      ),
      option(
        "承认渴望认可，找一个可靠的人说说。",
        { empathy: 3, expression: 2, insight: 1 },
        [6, 18, 15],
      ),
      option(
        "保留长期信心，继续积累并寻找合适时机。",
        { resilience: 3, order: 2, exploration: 1 },
        [17, 8, 10],
      ),
    ],
  ),
  question(
    19,
    "欲望与力量",
    "如果必须放弃一样东西，哪一样最让你犹豫？",
    "假设其余三样都能得到保留。",
    [
      option(
        "决定自己如何生活的选择权。",
        { freedom: 3, exploration: 2, drive: 1 },
        [0, 13, 7],
      ),
      option(
        "被重要的人真心选择和理解。",
        { empathy: 3, insight: 2, expression: 1 },
        [6, 3, 18],
      ),
      option(
        "把事情掌握在手里的确定感。",
        { order: 3, drive: 2, insight: 1 },
        [4, 15, 11],
      ),
      option(
        "相信未来仍能变好的那一点希望。",
        { resilience: 3, exploration: 2, empathy: 1 },
        [17, 19, 20],
      ),
    ],
  ),
  question(
    20,
    "欲望与力量",
    "当某件事让你上头，你怎样知道自己需要停一停？",
    "它可能是工作、关系、消费或一个目标。",
    [
      option(
        "它开始侵占睡眠、身体和原本的生活。",
        { order: 3, resilience: 2, empathy: 1 },
        [14, 3, 8],
      ),
      option(
        "我越来越害怕失去，已经很难自由选择。",
        { insight: 3, freedom: 2, empathy: 1 },
        [15, 18, 2],
      ),
      option(
        "继续投入只是在证明过去的决定没错。",
        { insight: 3, drive: 2, order: 1 },
        [16, 11, 13],
      ),
      option(
        "我开始忘记，最初为什么想做这件事。",
        { freedom: 3, resilience: 2, exploration: 1 },
        [20, 9, 12],
      ),
    ],
  ),
  question(
    21,
    "成长与整合",
    "回看一次重要的失误，你更愿意怎样记住它？",
    "不必替过去的自己打分。",
    [
      option(
        "它教会我建立方法，下次会更有准备。",
        { order: 3, drive: 2, resilience: 1 },
        [11, 5, 4],
      ),
      option(
        "它让我放下一个不再适合自己的身份。",
        { freedom: 3, insight: 2, resilience: 1 },
        [13, 16, 20],
      ),
      option(
        "它提醒我，对自己和别人都温柔一点。",
        { empathy: 3, resilience: 2, insight: 1 },
        [8, 14, 3],
      ),
      option(
        "它是故事的一部分，我依然可以往前走。",
        { exploration: 3, resilience: 2, expression: 1 },
        [0, 17, 21],
      ),
    ],
  ),
  question(
    22,
    "成长与整合",
    "有人问你“你真正想要什么”，你最接近哪种答案？",
    "选当前的你，而不是理想中的标准答案。",
    [
      option(
        "做出一些属于自己的东西，留下真实痕迹。",
        { drive: 3, expression: 2, freedom: 1 },
        [1, 19, 7],
      ),
      option(
        "把生活过得丰盛，也与重要的人好好相处。",
        { empathy: 3, expression: 2, order: 1 },
        [3, 6, 21],
      ),
      option(
        "活得更清醒，分辨愿望与外界的期待。",
        { insight: 3, freedom: 2, resilience: 1 },
        [2, 9, 20],
      ),
      option(
        "暂时还没完全知道，但愿意给答案一点时间。",
        { exploration: 3, insight: 2, resilience: 1 },
        [12, 10, 17],
      ),
    ],
  ),
  question(
    23,
    "成长与整合",
    "你希望未来的自己，对现在的你说什么？",
    "哪句话最能让你松一口气？",
    [
      option(
        "你可以出发，不必等所有条件都准备好。",
        { exploration: 3, drive: 2, freedom: 1 },
        [0, 1, 7],
      ),
      option(
        "不必一直绷紧，你已经有能力接住变化。",
        { resilience: 3, empathy: 2, insight: 1 },
        [8, 10, 14],
      ),
      option(
        "有些结束是必要的，你终于为自己做了选择。",
        { freedom: 3, resilience: 2, drive: 1 },
        [13, 16, 20],
      ),
      option(
        "你不需要证明完整，生活本身已经值得。",
        { empathy: 3, resilience: 2, expression: 1 },
        [21, 19, 17],
      ),
    ],
  ),
  question(
    24,
    "成长与整合",
    "走到一扇未知的门前，什么会让你愿意推开它？",
    "这是最后一题，请把答案留给此刻的自己。",
    [
      option(
        "门后还有我没见过的世界。",
        { exploration: 3, freedom: 2, expression: 1 },
        [0, 10, 19],
      ),
      option(
        "我终于准备好，回应内心很久以前的呼唤。",
        { drive: 3, insight: 2, resilience: 1 },
        [20, 1, 13],
      ),
      option(
        "我相信自己，也相信会遇到同行的人。",
        { empathy: 3, resilience: 2, exploration: 1 },
        [17, 6, 21],
      ),
      option(
        "我带着自己的原则，知道什么值得守护。",
        { order: 3, freedom: 2, resilience: 1 },
        [5, 11, 8],
      ),
    ],
  ),
];

export function publicQuestions() {
  return questions.map(({ options, ...question }) => ({
    ...question,
    options: options.map(({ text }) => ({ text })),
  }));
}
