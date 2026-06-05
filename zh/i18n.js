/**
 * Little Alchemy 2 中文汉化补丁（纯 DOM 替换版 v2）
 * 通过 MutationObserver 监听所有文本节点，将英文介绍替换为中文。
 * 内嵌完整英→中映射表，无需额外网络请求。
 */

(function() {
  'use strict';

  const DEBUG = false;  // 调试日志开关
  const log = (...args) => DEBUG && console.log('[汉化]', ...args);
  const warn = (...args) => console.warn('[汉化]', ...args);

  // ========== 内嵌英→中映射表（完全自给，不依赖网络） ==========
  // 格式：{ "英文原文": "中文译文" }
  const EN_TO_ZH = {
    "The All-Liquid.": "万物之源。",
    "Provider of warmth, light, and destruction.": "温暖、光明与毁灭的提供者。",
    "The land that makes up the third rock from the sun.": "构成太阳系第三颗岩石行星的土壤。",
    "A mixture of seemingly invisible gases that form Earth's atmosphere.": "形成地球大气的无形气体混合物。",
    "Hot air-sweats.": "热乎乎的空气汗珠。",
    "Hot-n-Ready liquefied rock.": "加热即食的液化岩石。",
    "The exertion of force upon an object by something in contact with it, be it physical or figurative.": "物体接触时施加的力量，无论是物理上的还是比喻上的。",
    "A fiery pimple of the Earth.": "地球上一颗火热的青春痘。",
    "Commonly mistaken for an ocean, it is a smaller body of water that's at least partially surrounded by land.": "常被误认为是海洋，其实是被陆地至少部分包围的小水体。",
    "A vast expanse of salt water that is filled with unimaginable horrors.": "一片充满难以想象的恐怖的咸水汪洋。",
    "The universal motivator.": "万物的动力源。",
    "Water and earthy matter's soft, sodden child.": "水和泥土柔软湿润的孩子。",
    "Tears of the clouds.": "云朵的眼泪。",
    "Earth's dandruff.": "地球的头皮屑。",
    "Natural containers of water suspended in the air.": "悬挂在空中的天然水容器。",
    "Violent clouds.": "暴力的云。",
    "An exclamatory jet of water and steam that is exhaled by a hot spring.": "温泉喷发出的惊叹号般的水汽射流。",
    "A small body of land surrounded by water, frequently the location of escapist daydreams.": "被水环绕的一小块陆地，经常是逃避现实的梦想之地。",
    "Ground ripples caused by movements within the Earth's crust. ": "地壳运动引起的地面波纹。",
    "Air that blows all over the place and defies all attempts at prediction.": "四处乱吹、拒绝被预测的空气。",
    "What happens when a volcano sneezes.": "火山打喷嚏时的产物。",
    "The domain of clouds.": "云的领地。",
    "God's straw.": "上帝的吸管。",
    "The original solar-powered organism.": "最早以太阳能为生的有机体。",
    "A powder that explodes when excited.": "一兴奋就会爆炸的粉末。",
    "Violent expansion used for destruction and spectacle.": "用于破坏和表演的剧烈膨胀。",
    "Breaker of bones and other such valuables.": "骨头及其他贵重物品的粉碎机。",
    "A fine debris of stones that gets everywhere.": "无孔不入的细碎石屑。",
    "Fire dandruff.": "火焰的头皮屑。",
    "The original fossil fuel.": "最早的化石燃料。",
    "Super Hyper Pressurized Carbon Turbo: Crystal Edition.": "超级高压碳涡轮：水晶版。",
    "A brittle, transparent substance, and primary weapon in the war against ants.": "一种易碎的透明物质，是对抗蚂蚁战争中的主要武器。",
    "Egg timer prototype.": "煮蛋计时器的原型。",
    "Fish limbo.": "鱼类的极限挑战。",
    "Daycare for plants.": "植物的托儿所。",
    "The Wonder Material! Hard, soft, shiny, dull, liquid, solid; it can do it all!": "奇迹材料！硬、软、亮、暗、液态、固态——十八般武艺全都会！",
    "Chapped lips for Iron. Thanks Oxygen!": "铁生了口疮。多谢氧气！",
    "A generator of steam and nightmares for young children who dared to explore their family's basement.": "蒸汽与噩梦的制造机——每个胆敢探索自家地下室的小孩都懂的恐惧。",
    "Gun currency.": "枪械的货币。",
    "Harder and stronger sibling of Iron, though a bit tempermental.": "铁的更强更硬的兄弟，虽然脾气有点暴躁。",
    "THE FOURTH DIMENSION.": "第四维度的永恒前进。",
    "Source of wood, and eternal adversary of lumberjacks.": "木材的来源，伐木工的永恒对手。",
    "You will never find a more wretched hive of scum and wetland-that's-heavily-dependant-upon-natural-water-fluctuations.": "你再也找不到比这更肮脏的、依赖自然水位变化的湿地黑窝了。",
    "It finds a way.": "生命自会找到出路。",
    "Fish finger food.": "鱼的手指食物。",
    "Dinosaur in hiding.": "隐藏版的恐龙。",
    "A pyromaniacal bird that's very difficult to kill.": "一只纵火成癖、极难杀死的鸟。",
    "The most dangerous game.": "最危险的猎物。",
    "An organic container of life, and important subject of certain philosophical questions related to causality.": "生命的有机容器，也是某些因果哲学问题的重要研究对象。",
    "There's wet dirt and then there's fine, wet dirt.": "有湿泥，还有细腻的湿泥。",
    "A human figure made out of clay, and given unnatural life.": "用黏土塑造的人形，被赋予了非自然的生命。",
    "Objects made out of clay, and hardened by heat and tenacity.": "用黏土制成，经过高温和坚韧的意志而硬化。",
    "A device used to achieve a goal, like a hammer to pound a nail or a Skynet to eliminate humanity.": "用来达成目标的装置——就像用锤子钉钉子，或者用天网消灭人类。",
    "Energy brought to you by Steam!": "蒸汽带给你的能量！",
    "The part that cuts instead of stabs!": "用来切割而非刺入的部分！",
    "Tree meat.": "树木的肉。",
    "Instrument used to question trees.": "用来质问树木的工具。",
    "It takes trees to tango. ": "树木才能跳探戈。",
    "The eternal fire shared with someone else.": "与他人分享的永恒之火。",
    "A tree wrangler.": "树木驯服师。",
    "Rail-mounted vehicle used for the transportation of people, supplies, and dreams.": "轨道车辆，用于运输人员、物资和梦想。",
    "A boat that runs on water vapor, and is now mostly enjoyed by history aficionados.": "靠水蒸气驱动的船，现在主要被历史爱好者所喜爱。",
    "Outdoor communal heat dispenser and cooker.": "户外公共取暖和烹饪装置。",
    "Baby fish containers.": "鱼宝宝的容器。",
    "An egg-based dish containing whatever's left in one's refrigerator.": "以鸡蛋为基础，填入冰箱剩余食材的料理。",
    "Salty fish eggs.": "咸咸的鱼卵。",
    "Slow, but steady shellborn reptiles. ": "缓慢但稳重的带壳爬行动物。",
    "Any gill-breathing vertebrate that hangs out under the sea.": "任何用鳃呼吸、在海里混的脊椎动物。",
    "A type of reptile that is prone to lounging.": "一种喜欢懒洋洋待着的爬行动物。",
    "Land ripe for planting.": "适合种植的土地。",
    "Major supplier of fruits, vegetables, and/or can-do attitudes.": "水果、蔬菜和/或积极态度的主要供应商。",
    "A building for people to live in, with an option for pets and/or ghosts.": "供人居住的建筑，可选的附加项：宠物和/或鬼魂。",
    "Farm animals with a purpose.": "有使命的农场动物。",
    "Apparently everything tastes like it.": "显然所有东西吃起来都像它。",
    "Nature's carpet.": "大自然的地毯。",
    "A female ox that is used for its milk, beef, and likeability as a mascot.": "因牛奶、牛肉和吉祥物般的可爱度而被利用的雌牛。",
    "Cereal sauce.": "麦片的酱料。",
    "The only benefit to letting milk go bad.": "让牛奶变质带来的唯一好处。",
    "A planetary groupie.": "行星的追星族。",
    "Dried leaves that are enjoyed smoked, chewed, or sniffed.": "干燥的叶子，可吸、可嚼、可闻。",
    "A small bowl that one smokes from by way of a connected tube.": "带连接管的小碗，用来吸食。",
    "That which rolled first.": "最先滚动的东西。",
    "A two-wheeled vehicle that's powered by YOU.": "由你驱动的两轮车！",
    "A cereal grain, and bedrock of baked goods.": "谷类作物，烘焙食品的基石。",
    "The white powder created by grinding grains.": "研磨谷物产生的白色粉末。",
    "Wheat's third evolution.": "小麦的第三次进化。",
    "A baked food made from flour, water, and yeast, that is sometimes broken in the pursuit of fellowship.": "用面粉、水和酵母烤制的食物，有时为了情谊而掰开分享。",
    "A totally sweet plant product.": "完全甜的植物产品。",
    "A deliciously-filled pastry that is the bane of all clowns.": "美味的馅饼，所有小丑的克星。",
    "The edible body parts of animals.": "动物可食用的身体部位。",
    "Unruly edibles held together by bread bouncers.": "被面包保安管束的不羁食材们。",
    "Herald of fire.": "火焰的使者。",
    "The upper leg meat of a pig that has been made tasty.": "猪的上腿肉，经过调味变得美味。",
    "A weapon where a projectile is explosively propelled out of a metal tube.": "一种将弹丸爆炸性地从金属管中射出的武器。",
    "A lifeless human body.": "没有生命的人类身体。",
    "Something alive that should be dead. ": "本该死了却还活着的东西。",
    "The last bed most of us will ever sleep in.": "我们大多数人最后安睡的床。",
    "An area where a dead body has been deposited publicly or secretly.": "尸体被公开或秘密放置的地方。",
    "The deadest of subterranean parties.": "最死寂的地下派对。",
    "A craft that allows one to travel over water while still being at its mercy.": "一种能让人在水上旅行、同时又受其摆布的工艺。",
    "The land that rain forgot.": "被雨水遗忘的土地。",
    "Desert trees that are VERY against hugging.": "非常反对拥抱的沙漠树木。",
    "Sea grass. ": "海里的草。",
    "A mythical giant reptile that flies, breathes fire, and is voiced by a British actor.": "一种会飞、会喷火、由英国演员配音的巨型神话爬行动物。",
    "A rider of one, two, or three-wheeled contraptions, but NEVER FOUR.": "单轮、双轮或三轮车辆骑手，但绝不是四轮。",
    "Person sworn to war against fires.": "宣誓与火战斗的人。",
    "The body of sand along a shore, where glistening volleyball games are played.": "岸边的沙地，阳光沙滩排球的比赛场地。",
    "The center of our galactic party.": "我们银河派对的中心。",
    "Branchless tree that's fond of warm weather.": "没有树枝的树，喜欢温暖天气。",
    "A curved band of colors caused by refraction, rain, and the occasional pot of gold.": "由折射、雨水和偶尔的一罐金子形成的彩色弧带。",
    "A wave that's probably too big to surf. ": "大到不适合冲浪的浪。",
    "Red liquid that keeps humans and vampires alive.": "维持人类和吸血鬼生命的红色液体。",
    "A boat that travels at the mercy of the wind gods.": "依靠风神摆布的船。",
    "Charged particles, or as it's more technically known: THE POWER OF THE GODS.": "带电粒子，或者更技术地说：神的力量。",
    "An illuminator, both physically and mentally.": "照明物，无论是物理上的还是精神上的。",
    "A light-strewn tree used as part of an arcane ritual to summon the immortal creature known as Santa.": "挂满灯的树，用于召唤名为圣诞老人的不朽生物的仪式。",
    "An instrument for measuring time and driving hooked pirates insane.": "测量时间的工具，也能把上了发条的海盗逼疯。",
    "The tragic result of a mad scientist's quest to conquer death": "疯狂科学家征服死亡之路的悲剧成果。",
    "Electric veins!": "电的血管！",
    "Mechanical saw with spinning teeth of DEATH.": "带有旋转死亡之齿的机械锯。",
    "An electricity tamer.": "电的驯服者。",
    "The universal illuminator.": "万物的照明者。",
    "Electric river snake. ": "电做的河蛇。",
    "The sun groupie of plants.": "植物的太阳追星族。",
    "The juices left from a decomposing body.": "腐烂尸体留下的汁液。",
    "The Sun's gaze upon Earth.": "太阳凝视地球的目光。",
    "The time when the Earth is hiding from the Sun.": "地球躲着太阳的时间。",
    "A light glutton.": "光的贪吃鬼。",
    "Celestial shadow puppets.": "天体的皮影戏。",
    "Recurring disturbances through a medium, such as the sound produced by a gong being hit or the ripples spread from a slapped belly.": "通过介质传播的反复扰动——比如被敲击的锣声，或者被拍打的肚子上的涟漪。",
    "When the Earth is caught between the love of the moon and the Sun, and oceans and inlets can't decide which way to go.": "地球夹在月亮和太阳的爱之间，海洋和港湾不知该往哪去的时候。",
    "The only place where an accidental fire isn't a dangerous mistake.": "唯一一个意外失火不是危险错误的地方。",
    "The OG clock.": "最早的钟表。",
    "An extremely rare occurence, with exposure to it resulting in exaltations of awe and wonder.": "哇！双倍彩虹，双倍快乐！",
    "A deadly tool against grass that is often wielded by death itself.": "对付草的致命工具，常常被死神本人挥舞。",
    "Nameplate for the dead.": "死者的名牌。",
    "Last call for light!": "光线的最后一站！",
    "Wind-powered instrument with a holey sound.": "靠风驱动的乐器，声音千疮百孔。",
    "A device for when one's really into smoke on the water.": "当你特别想在水中玩烟雾时用的装置。",
    "Multicellular organisms that perpetually hunger for other organic matter, and are commonly classified in cracker form.": "永远饥饿的多细胞有机体，通常以饼干形式分类。",
    "An armless and legless undulating nightmare of an animal.": "没有手臂和腿的波浪形噩梦动物。",
    "Being unwell, either through genetics or foreign contaminant.": "身体不适，无论是遗传还是外来污染物造成的。",
    "A brisk feeling, possibly leading to uncontrollable shaking. ": "寒冷的感觉，可能导致无法控制的颤抖。",
    "Baby ice crystals! ": "冰晶宝宝！",
    "The nauseating result of seeing things move one way, but feeling them move another.": "眼睛看到一边动、身体感觉另一边动而产生的恶心感。",
    "Snow that has been crudely shaped to resemble a person and given sentimental value.": "粗略捏成人形并被赋予情感价值的雪。",
    "Bread that is burned on purpose.": "故意烤焦的面包。",
    "Solid water that's allergic to heat.": "对热过敏的固体水。",
    "A really long knife that's sharp on both sides.": "一把两面都锋利的长刀。",
    "Nature's finest dressers.": "大自然最会穿衣服的生物。",
    "Wind-powered grain grinder.": "风动力的谷物研磨机。",
    "Rain that has been corrupted by pollution.": "被污染腐蚀的雨。",
    "A large winged vehicle that relies on thrust to fly.": "依赖推力飞行的大型带翼交通工具。",
    "Aquatic plants that don't have true roots, stems, and leaves, but do have the hope of millions that they will replace fossil fuels in the near future.": "没有真正的根、茎、叶的水生植物，但承载着数百万人对它们替代化石燃料的希望。",
    "The body's response to something it doesn't like.": "身体对不喜欢的东西的反应。",
    "The one with the wider, u-shaped snout.": "有着更宽U形吻部的那位。",
    "One who wars.": "战斗之人。",
    "Divine servant of God.": "神的圣仆。",
    "The forgotten continent at the end of the world.": "世界尽头被遗忘的大陆。",
    "A motley crew of islands.": "一群乌合之众的岛屿。",
    "Wearable defenses. ": "可穿戴的防御装备。",
    "A space adventurer.": "太空冒险家。",
    "The layer of gases surrounding our planet that protects us from various invisible space horrors.": "包围我们星球的气体层，保护我们免受各种隐形太空恐怖的侵害。",
    "A very atomically-correct bomb.": "非常原子正确的炸弹。",
    "Clean, delicious, snout-nosed animal known for their sheep-herding skills.": "干净、美味、长着猪嘴的动物，以牧羊技能闻名。",
    "Microorganisms that are essential for life even though they sometimes help take it away.": "对生命至关重要的微生物——尽管它们有时也帮助夺走生命。",
    "The farm garage.": "农场的车库。",
    "The knife that's brought to a gun fight.": "被带到枪战中的刀。",
    "The lumberjack of the animal kingdom.": "动物王国里的伐木工。",
    "A human-approved dwelling for birds.": "人类认可的鸟类住所。",
    "A snowy windstorm.": "带雪的狂风。",
    "A block of hardened clay that's used for construction and metaphors.": "硬化的黏土块，用于建筑和比喻。",
    "The terror that (silently) flaps in the night.": "在黑夜中（无声）拍打的恐怖。",
    "A person who cuts up meat for fun or profit.": "为了乐趣或利润而切割肉类的人。",
    "A four-wheeled vehicle that is powered by an engine, and is used for cruising on land in various capacities.": "由发动机驱动的四轮车辆，用于各种陆上巡航活动。",
    "What's left when wood or other organic things aren't allowed access to air, and then set ablaze.": "木材或其他有机物在隔绝空气后燃烧剩下的东西。",
    "A ball of perpetually exploding gas in space.": "太空中不断爆炸的气体球。",
    "An armorclad warrior who served under a designated ruler, an honorary title bestowed upon a man, and an outdated notion of chivalry.": "穿甲的战士，在指定统治者麾下服务——一个授予男性的荣誉头衔，一种过时的骑士精神。",
    "A bird with a call so annoying, it was adopted as an alarm for clocks.": "叫声极其烦人以至于被用作闹钟的鸟。",
    "Earth's long gone reptile overlords.": "地球早已消失的爬行动物霸主。",
    "A domesticated mammal that longs to be your best friend.": "梦想成为你最好的朋友的驯化哺乳动物。",
    "Short aquatic birds with webbed feet and surly dispositions.": "短小的水鸟，脚上有蹼，脾气暴躁。",
    "A ridge of sand formed by wind and sandworms.": "由风和沙虫形成的沙脊。",
    "The machine whisperer.": "机器呢喃者。",
    "A wearable device that helps with eyesight by compensating for bad genetic luck or staring at the TV too much.": "帮助视力的可穿戴设备，弥补糟糕的基因运气或看电视太多造成的后果。",
    "A group that is united by blood, marriage, and/or a love of high-speed cars.": "因血缘、婚姻和/或对高速赛车的热爱而团结的群体。",
    "A tree bearing gifts.": "结出礼物的树。",
    "A fruit tree neighborhood.": "果树组成的社区。",
    "Socially-acceptable explosions that are often used for celebrations.": "社会可接受的爆炸，常用于庆典。",
    "A large amount of water that has temporarily outgrown its home.": "大量暂时溢出家园的水。",
    "Land clouds.": "陆地上的云。",
    "A small area used for growing flowers, fruits, vegetables, or rocks.": "用来种植花朵、水果、蔬菜或石头的小区域。",
    "A portable explosion.": "便携式爆炸物。",
    "Rain that has frozen on its way to the ground.": "在落地途中结冰的雨。",
    "Dried grass that is used to feed livestock and hide needles.": "干燥的草，用于喂养家畜和隐藏针头。",
    "A person who is idealized or admired for courageous actions like saving a drowning child or refilling the communal coffee pot.": "因勇敢行为——比如救起落水儿童或重新装满公用咖啡壶——而被理想化或崇拜的人。",
    "The line where earth and sky meet.": "天地相接的线。",
    "A hornless unicorn, commonly used for transportation and racing.": "没有角的独角兽，常用于运输和赛跑。",
    "An institution for receiving medical care, and inspiration for countless TV shows.": "接受医疗护理的机构，也是无数电视剧的灵感来源。",
    "A frozen food made from dairy products that can be combined with a comically-large range of ingredients.": "用乳制品制成的冷冻食品，可与滑稽数量的配料混合。",
    "An abrubtly tall land formation.": "突然升高的陆地。",
    "An enormous moving ice blanket.": "巨大的移动冰毯。",
    "A volatile liquid used in chemistry and certain adult beverages.": "用于化学和某些成人饮品的挥发性液体。",
    "An exceedingly skillful programmer and wearer of monochromatic hats.": "技艺超群程序员，单色帽子的佩戴者。",
    "A two-wheeled wagon.": "两轮货车。",
    "A four-wheeled cart.": "四轮马车。",
    "Someone who practices medicine or time traveling.": "行医或时间旅行的人。",
    "Finely shaved, pulped, and pressed tree meat.": "精细削碎、打浆、压制的树木肉。",
    "A periodical publication printed with timely articles and funnies.": "印有及时文章和搞笑漫画的期刊。",
    "A crystalline substance commonly used in food consumption, preservation, and competitive wrestling rituals.": "用于食品消费、保存和竞技摔跤仪式的结晶物质。",
    "An undead individual who feasts on the blood of others, and is very self-conscious about arriving uninvited.": "以他人血液为食的不死个体，对不请自来这件事非常在意。",
    "Glasses with darkened lenses that protect one's eyes from the glares of sunlight and jealousy.": "带有深色镜片的眼镜，保护眼睛免受阳光和嫉妒的注视。",
    "Snow forts for adults.": "给成年人住的雪堡。",
    "When you don't have time to go to the beach, but still want to find sand on your persons for the next month.": "当你没时间去海滩，但接下来一个月身上还是能找到沙子的情况。",
    "An area in the desert where there's enough water for trees and hope to grow.": "沙漠中水源足以让树木和希望生长的地方。",
    "A machine that can be electronically programmed to carry out a variety of physical tasks automatically, and is the face of humanity's downfall.": "可通过电子编程自动执行各种物理任务的机器，也是人类灭亡的元凶。",
    "A culturally acceptable way of eating raw fish.": "一种文化上可以接受的生吃鱼的方式。",
    "A hideout for children that's located in a tree.": "建在树上的儿童藏身处。",
    "A majestic horse with a single horn in the middle of its forehead.": "额头正中长着一只角的高贵马匹。",
    "Meat from the back and sides of a pig that is salted, smoked, and lusted over.": "猪背部和侧面的肉，经过腌制、烟熏，令人垂涎。",
    "The most commonly used tobacco consumption system.": "最常用的烟草消耗系统。",
    "Someone who literally has their head in the clouds all the time.": "整天把头埋在云里的人。",
    "A small fish whose head barely resembles a horse.": "一种小鱼的头部勉强像马。",
    "The petrified remains of ancient organisms.": "古代生物石化后的遗骸。",
    "A small circular band of material used for decoration, and may be set with gemstones or the black speech of the dark lord.": "用于装饰的小圆环材料，可能嵌有宝石或黑暗魔君的黑语。",
    "A winged hornless unicorn.": "有翅膀的无角独角兽。",
    "A type of carnivorous fish known for their flexible skeletons, occasional encounters with humans, and fondness for oxygen tanks.": "一种以灵活骨架、偶尔接触人类和喜欢氧气罐闻名的肉食鱼类。",
    "The realm in which planets and stars live.": "行星和恒星生活的领域。",
    "Bacteria + dairy = profit.": "细菌+乳制品=利润。",
    "An electronic device that can both aid and hinder work.": "既能帮助也能阻碍工作的电子设备。",
    "A small rodent that has inspired and annoyed millions.": "既启发又惹恼了数百万人的小啮齿动物。",
    "A bread magician.": "面包魔术师。",
    "A mighty wooden marker.": "强大的木质标记笔。",
    "A fish that is solely composed of arms and feet.": "完全由手臂和脚组成的鱼。",
    "Classy, grape-flavored alcohol.": "优雅的葡萄味酒精。",
    "Squinting instrument.": "眯眼工具。",
    "The greatest of the dinner pies.": "晚餐派中最伟大的那一个。",
    "A small mammal that is kept as a pet and believes it owns everything.": "被当作宠物的小型哺乳动物，深信自己拥有一切。",
    "Earsight.": "耳朵视觉。",
    "An elegant weapon for a more civilized age.": "一个更文明时代的优雅武器。",
    "Guardians of peace and justice in the Old Republic.": "旧共和国和平与正义的守护者。",
    "A dog who doesn't play by the rules.": "不按规矩出牌的狗。",
    "Someone who changes into a wolf during a full moon and is allergic to silver.": "月圆时变成狼、对银过敏的人。",
    "An attempt at making death easier to comprehend.": "让死亡更容易理解的尝试。",
    "Crewmember of a seafaring vessel, and singer of shanties.": "海船的船员，也是船歌的歌手。",
    "The humped horse of the desert.": "沙漠中的驼峰马。",
    "A vertical structure used to keep things in. Or out.": "用来把东西关在里面或挡在外面的垂直结构。",
    "A star dancer.": "恒星舞者。",
    "A self-propelled device that's as inspiring as it is deadly.": "既鼓舞人心又致命的自主装置。",
    "Fish that are saddled with a sword for a nose.": "鼻子上装了一把剑的鱼。",
    "When the mechanical gears and pulleys controlling your body's motor functions are gunked up with too much alcohol.": "当控制身体运动机能的机械齿轮和滑轮被太多酒精堵塞的时候。",
    "Sounds as art.": "作为艺术的声音。",
    "Evil fog. ": "邪恶的雾。",
    "Casual alcohol.": "随意喝的酒精。",
    "Noisy ducks. Well, noisier.": "吵闹的鸭子——更吵闹的那种。",
    "The delicious liquid obtained from fruit or vegetables.": "从水果或蔬菜中获取的美味液体。",
    "A small community in a rural area.": "乡村地区的小社区。",
    "An instrument to make cutting easier.": "让切割更容易的工具。",
    "A series of events or incidents told via campfire, book, cave drawing, or laborious voice over.": "通过篝火、书本、洞穴壁画或辛苦旁白讲述的一系列事件。",
    "Physical emails.": "物理版的电子邮件。",
    "Natural candy of a certain type of palm tree.": "某种棕榈树的天然糖果。",
    "A delicious natural laxative found within coconuts.": "椰子肉中发现的美味天然泻药。",
    "The double-edged sword of ingredients.": "食材中的双刃剑。",
    "Flying mammal and inspiration for vigilantes.": "会飞的哺乳动物，也是义警的灵感来源。",
    "Bushy-tailed rodents that live in trees and feast on nuts and stolen birdseed.": "尾巴蓬松的啮齿动物，住在树上，以坚果和偷来的鸟食为食。",
    "Nature's open-air water pipe.": "大自然的露天水管。",
    "A delightfully small and flattened cake.": "小巧可爱、压扁了的蛋糕。",
    "Great ice cube of the sea.": "海中的大冰块。",
    "Balding bird that feasts on the dead.": "秃头鸟，以腐尸为食。",
    "Skeleton puzzle pieces.": "骨架拼图碎片。",
    "Fortified building and occasional home of royalty.": "要塞建筑，偶尔是王室的住所。",
    "The wild man-horse.": "野生的人马。",
    "Beds made out of twigs, mud, and leaves that baby birds have to live in no matter how much they crow about it.": "由树枝、泥巴和叶子做成的床，小鸟们不管怎么抱怨也得凑合住。",
    "Inexplicable King of the Animal Kingdom despite the lionesses doing all the work.": "动物王国中莫名奇妙的王者，尽管所有工作都是母狮做的。",
    "A shelter for dogs to sit in or lay on top of.": "给狗坐或趴的庇护所。",
    "A building that's reaching for the sky.": "伸向天空的建筑。",
    "Highly volatile and explosive moldable stick.": "高度挥发、易爆炸的可塑棒。",
    "Frisky horned sheep.": "精力充沛的长角羊。",
    "Breakfast food made from roasted grains, and a contested member of a balanced breakfast.": "用烤谷物制成的早餐食品，也是均衡早餐中有争议的一员。",
    "Space hole that grows hungrier the more it eats, and whose tastes include everything in existence.": "吃越多越饿的空间洞，胃口包括存在的一切。",
  };

  // ========== 辅助函数 ==========
  function norm(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/\s+/g, ' ').trim();
  }

  function tryReplace(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return false;
    if (!node.textContent) return false;
    
    const rawText = node.textContent.trim();
    if (!rawText || rawText.length < 2) return false;
    
    // 跳过 script/style 标签内的文本
    if (node.parentElement) {
      const tag = node.parentElement.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return false;
    }
    
    // 多重匹配
    let zh = EN_TO_ZH[rawText];
    if (!zh) zh = EN_TO_ZH[norm(rawText)];
    if (!zh) {
      // 尝试去掉首尾引号
      const unquoted = rawText.replace(/^["'「『]|["'」』]$/g, '').trim();
      if (unquoted !== rawText) {
        zh = EN_TO_ZH[unquoted] || EN_TO_ZH[norm(unquoted)];
      }
    }
    
    if (!zh) return false;
    
    node.textContent = zh;
    return true;
  }

  function scanAll() {
    let count = 0;
    const walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT,
      null, false
    );
    let node;
    while (node = walker.nextNode()) {
      if (tryReplace(node)) count++;
    }
    if (count > 0) log('扫描替换:', count, '条');
    return count;
  }

  // ========== 启动 ==========
  let totalReplaced = 0;

  function start() {
    log('启动 DOM 翻译器，映射表共', Object.keys(EN_TO_ZH).length, '条');

    // 初始扫描（多次，适应游戏延迟加载）
    setTimeout(() => { totalReplaced += scanAll(); }, 300);
    setTimeout(() => { totalReplaced += scanAll(); }, 1000);
    setTimeout(() => { totalReplaced += scanAll(); log('阶段扫描结果:', totalReplaced, '条'); }, 3000);
    setTimeout(() => { totalReplaced += scanAll(); }, 5000);
    setTimeout(() => { totalReplaced += scanAll(); log('最终扫描结果:', totalReplaced, '条'); }, 10000);

    // MutationObserver
    const observer = new MutationObserver(function(mutations) {
      let count = 0;
      for (const mut of mutations) {
        if (mut.type === 'childList') {
          for (const node of mut.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
              let n;
              while (n = w.nextNode()) { if (tryReplace(n)) count++; }
            } else if (node.nodeType === Node.TEXT_NODE) {
              if (tryReplace(node)) count++;
            }
          }
        }
        if (mut.type === 'characterData') {
          if (tryReplace(mut.target)) count++;
        }
      }
      if (count > 0) {
        totalReplaced += count;
        log('增量替换:', count, '条, 累计:', totalReplaced);
      }
    });

    setTimeout(() => {
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
      });
      log('✅ MutationObserver 已激活');
    }, 200);

    // 定期补扫
    setInterval(() => {
      const c = scanAll();
      if (c > 0) { totalReplaced += c; log('补扫:', c, '条, 累计:', totalReplaced); }
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(start, 100));
  } else {
    setTimeout(start, 100);
  }
})();
