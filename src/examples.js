export const examples = [
  {
    id: 'budget', title: 'Monthly budget · 月度预算',
    program: `$income = 8000
$housing = 2600
$food = 1200
$transport = 500
remaining = $income - $housing - $food - $transport
root = Dashboard([Title("月度预算规划器"), Badge("演示数据 · 金额仅供体验", "muted"), intro, summary, planner, actions])
intro = Text("调整收入和各项预算，余额与图表会立即联动。所有金额都是示例，不是财务建议。", "muted")
summary = Grid([Metric("月收入", @Format($income, "¥")), Metric("可用余额", @Format(remaining, "¥"), "收入减去三项支出", remaining >= 0 ? "success" : "error")], 2)
planner = Grid([inputs, visual], 2)
inputs = Card("调整预算", [NumberInput("月收入", $income, 0, 100000, 100), Slider("住房", $housing, 0, 10000, 100), Slider("餐饮", $food, 0, 5000, 100), Slider("交通", $transport, 0, 3000, 50)])
visual = Card("支出分布", [Chart("每月支出与余额", "bar", [{label: "住房", value: $housing}, {label: "餐饮", value: $food}, {label: "交通", value: $transport}, {label: "余额", value: remaining}], "元")])
actions = Row([Button("重置预算", @Reset($income, $housing, $food, $transport), "secondary"), Button("根据我的预算给出节省建议", @ToAssistant("请根据我选择的示例预算给出节省建议。", {income: $income, housing: $housing, food: $food, transport: $transport, remaining: remaining}))])`,
  },
  {
    id: 'travel', title: 'Travel checklist · 旅行清单',
    program: `$passport = false
$tickets = true
$charger = false
$medicine = false
$destination = "京都"
$style = "relaxed"
completed = ($passport ? 1 : 0) + ($tickets ? 1 : 0) + ($charger ? 1 : 0) + ($medicine ? 1 : 0)
root = Dashboard([Title("出发前，轻松检查"), Badge("演示清单", "muted"), overview, body, actions])
overview = Grid([Metric("已准备", @Format(completed, "", 0) + " / 4", completed == 4 ? "一切就绪，祝旅途愉快" : "逐项勾选，避免遗漏", completed == 4 ? "success" : "brand"), Metric("目的地", $destination, "目的地与偏好可自由修改")], 2)
body = Grid([packing, preferences], 2)
packing = Card("随身必备", [Checkbox("护照与证件", $passport), Checkbox("车票 / 机票", $tickets), Checkbox("充电器与转换插头", $charger), Checkbox("常用药品", $medicine)])
preferences = Card("这次如何旅行？", [Input("目的地", $destination, "输入城市"), Select("旅行节奏", $style, [{label: "慢节奏探索", value: "relaxed"}, {label: "紧凑观光", value: "active"}]), Divider(), List(["出发前确认天气和交通安排", "将重要证件备份到安全位置", "演示数据，不代表实时旅行信息"], true)])
actions = Row([Button("全部准备好了", Action([@Set($passport, true), @Set($tickets, true), @Set($charger, true), @Set($medicine, true)]), "secondary"), Button("帮我完善旅行安排", @ToAssistant("请根据目的地、旅行节奏和准备情况，帮我完善旅行安排。", {destination: $destination, style: $style, completed: completed}))])`,
  },
  {
    id: 'table', title: 'Project comparison · 项目对比',
    program: `root = Dashboard([Title("把信息变成可操作的对比"), Badge("演示数据", "muted"), Text("输入关键字筛选项目，点击列标题切换排序。表格和图表均由本地组件渲染。", "muted"), metrics, comparison, trend, Button("解释这些项目的取舍", @ToAssistant("请解释这份示例项目对比中成本、工期和评分的取舍。", {source: "演示项目比较表"}))])
metrics = Grid([Metric("对比项目", 4, "虚构样例"), Metric("最高评分", "9.1 / 10", "示例综合评价", "success")], 2)
comparison = Card("项目比较", [Table(["项目", "预算（万元）", "工期（周）", "评分"], [["轻量工作台", 12, 3, 8.7], ["自动化报表", 18, 5, 9.1], ["知识中心", 10, 4, 8.4], ["协作看板", 15, 6, 8.9]], true)])
trend = Card("预计交付节奏", [Chart("四周演示进度", "line", [{label: "第1周", value: 15}, {label: "第2周", value: 40}, {label: "第3周", value: 72}, {label: "第4周", value: 100}], "%")])`,
  },
];
