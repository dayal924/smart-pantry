"""Single source of truth for produce catalog + recipes.
Run:  python shared/build_data.py   -> writes JSON to shared/, backend/app/data and mobile/src/data
Shelf-life numbers are conservative baseline estimates in the spirit of USDA FoodKeeper guidance;
review them before publishing. Keys are normalised class names (lowercase, '_' separated)."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]

# key, display, emoji, category, room_days, fridge_days, default_storage, grams/item, kcal, carbs, fiber, vitC, protein, tip  (nutrition per 100 g)
T = [
("apple","Apple","🍎","fruit",7,28,"fridge",180,52,13.8,2.4,4.6,0.3,"Keep in the crisper, away from other produce - apples release ethylene that ripens neighbours."),
("banana","Banana","🍌","fruit",5,7,"room",120,89,22.8,2.6,8.7,1.1,"Keep at room temperature and separate from the bunch to slow ripening. Fridge darkens the peel but the fruit stays fine."),
("beetroot","Beetroot","🟣","vegetable",7,21,"fridge",80,43,9.6,2.8,4.9,1.6,"Trim the leaves (keep 2 cm of stem) and store unwashed in the fridge."),
("bitter_gourd","Bitter Gourd","🥒","vegetable",3,7,"fridge",100,17,3.7,2.8,84,1.0,"Store unwashed in a paper bag in the fridge; use within a week."),
("bottle_gourd","Bottle Gourd","🥒","vegetable",4,10,"fridge",500,14,3.4,0.5,10.1,0.6,"Whole gourds keep a few days in a cool place; wrap and refrigerate cut pieces."),
("cabbage","Cabbage","🥬","vegetable",5,21,"fridge",900,25,5.8,2.5,36.6,1.3,"Keep the head whole and wrapped in the fridge; cut cabbage dries out fast."),
("capsicum","Capsicum","🫑","vegetable",4,12,"fridge",150,20,4.6,1.7,80.4,0.9,"Store dry in the crisper; wash just before use."),
("carrot","Carrot","🥕","vegetable",5,28,"fridge",70,41,9.6,2.8,5.9,0.9,"Remove green tops and keep in the crisper; soak limp carrots in cold water to revive."),
("cauliflower","Cauliflower","🥦","vegetable",3,10,"fridge",600,25,5.0,2.0,48.2,1.9,"Store the head stem-side down, loosely wrapped, in the fridge."),
("cherry","Cherry","🍒","fruit",2,10,"fridge",8,50,12.2,1.6,7.0,1.0,"Refrigerate unwashed in a breathable bag; wash right before eating."),
("chilli","Chilli","🌶️","vegetable",4,14,"fridge",10,40,8.8,1.5,143.7,2.0,"Keep dry in a paper bag in the fridge; freeze extras whole."),
("coconut","Coconut","🥥","fruit",10,30,"room",400,354,15.2,9.0,3.3,3.3,"Whole coconuts keep at room temperature; refrigerate opened flesh in water or an airtight box."),
("cucumber","Cucumber","🥒","vegetable",3,10,"fridge",300,15,3.6,0.5,2.8,0.7,"Keep in the warmer part of the fridge (not the coldest shelf) and dry."),
("eggplant","Eggplant","🍆","vegetable",3,7,"fridge",300,25,5.9,3.0,2.2,1.0,"Chill-sensitive: use within a few days, store unwashed in the crisper."),
("ginger","Ginger","🌿","vegetable",14,28,"fridge",25,80,17.8,2.0,5.0,1.8,"Refrigerate unpeeled in a paper bag, or freeze and grate straight from frozen."),
("grape","Grape","🍇","fruit",2,10,"fridge",150,69,18.1,0.9,3.2,0.7,"Refrigerate unwashed on the stem in a perforated bag."),
("green_orange","Green Orange","🍊","fruit",7,21,"room",150,43,9.4,2.4,53.2,0.9,"Keep at room temperature for about a week; refrigerate to extend."),
("kiwi","Kiwi","🥝","fruit",5,21,"fridge",75,61,14.7,3.0,92.7,1.1,"Ripen at room temperature, then move to the fridge to hold."),
("maize","Maize","🌽","vegetable",1,5,"fridge",150,86,18.7,2.0,6.8,3.3,"Sugars turn to starch quickly - refrigerate in the husk and cook within days."),
("mango","Mango","🥭","fruit",5,10,"room",200,60,15.0,1.6,36.4,0.8,"Ripen at room temperature; refrigerate once ripe."),
("onion","Onion","🧅","vegetable",30,60,"room",110,40,9.3,1.7,7.4,1.1,"Cool, dark and ventilated. Wrap cut onion tightly and refrigerate for 2-3 days; keep away from potatoes."),
("orange","Orange","🍊","fruit",7,21,"room",130,47,11.8,2.4,53.2,0.9,"Fine on the counter for a week; fridge extends to about three."),
("papaya","Papaya","🍈","fruit",4,8,"room",500,43,10.8,1.7,60.9,0.5,"Ripen at room temperature, then refrigerate."),
("pineapple","Pineapple","🍍","fruit",3,7,"room",900,50,13.1,1.4,47.8,0.5,"Does not ripen further after picking; refrigerate cut pieces airtight."),
("potato","Potato","🥔","vegetable",30,45,"room",170,77,17.5,2.2,19.7,2.0,"Cool, dark place. Cold storage can turn starch to sugar; discard green or sprouted potatoes."),
("pumpkin","Pumpkin","🎃","vegetable",60,90,"room",1500,26,6.5,0.5,9.0,1.0,"Whole pumpkins keep for weeks in a cool dry spot; refrigerate cut pieces."),
("radish","Radish","🔴","vegetable",3,14,"fridge",60,16,3.4,1.6,14.8,0.7,"Cut off the tops and keep in a bag with a damp paper towel."),
("tomato","Tomato","🍅","vegetable",6,10,"room",120,18,3.9,1.2,13.7,0.9,"Ripen at room temperature stem-side down; refrigerate only when fully ripe and bring back to room temperature to eat."),
("spinach","Spinach","🥬","vegetable",1,3,"fridge",100,23,3.6,2.2,28.1,2.9,"Keep dry with a paper towel in an airtight box; wash only before use."),
("lemon","Lemon","🍋","fruit",7,28,"room",60,29,9.3,2.8,53.0,1.1,"Counter for a week; fridge for a month."),
("garlic","Garlic","🧄","vegetable",30,60,"room",40,149,33.1,2.1,31.2,6.4,"Whole bulbs like cool, dry, airy storage."),
("okra","Okra","🌿","vegetable",2,7,"fridge",12,33,7.5,3.2,23.0,1.9,"Keep dry and unwashed in a paper bag; moisture makes it slimy."),
("strawberry","Strawberry","🍓","fruit",1,5,"fridge",15,32,7.7,2.0,58.8,0.7,"Refrigerate unwashed in a single layer; remove any mouldy berries immediately."),
("watermelon","Watermelon","🍉","fruit",7,14,"room",4000,30,7.6,0.4,8.1,0.6,"Whole melon on the counter; refrigerate cut pieces covered."),
("pear","Pear","🍐","fruit",4,14,"fridge",180,57,15.2,3.1,4.3,0.4,"Ripen on the counter, then refrigerate."),
("guava","Guava","🍈","fruit",3,7,"room",100,68,14.3,5.4,228.0,2.6,"Ripen at room temperature, then refrigerate."),
("pomegranate","Pomegranate","🔴","fruit",7,30,"room",280,83,18.7,4.0,10.2,1.7,"Whole fruit lasts weeks; refrigerate seeds airtight."),
("peach","Peach","🍑","fruit",3,7,"room",150,39,9.5,1.5,6.6,0.9,"Ripen on the counter, then refrigerate."),
("melon","Melon","🍈","fruit",5,10,"room",1000,34,8.2,0.9,36.7,0.8,"Whole melon keeps on the counter; refrigerate cut pieces covered."),
("peas","Peas","🟢","vegetable",1,5,"fridge",80,81,14.5,5.1,40.0,5.4,"Keep pods unwashed in the fridge and shell just before cooking."),
("turnip","Turnip","🟣","vegetable",5,14,"fridge",120,28,6.4,1.8,21.0,0.9,"Remove the greens and keep roots in the crisper."),
("lettuce","Lettuce","🥬","vegetable",2,7,"fridge",300,15,2.9,1.3,9.2,1.4,"Wrap in a dry towel inside a box; tear leaves rather than cutting."),
("broccoli","Broccoli","🥦","vegetable",2,7,"fridge",300,34,6.6,2.6,89.2,2.8,"Store unwashed in a loose bag in the crisper."),
]
ALIASES = {"brinjal":"eggplant","aubergine":"eggplant","lady_finger":"okra","ladyfinger":"okra","bhindi":"okra","bell_pepper":"capsicum","pepper":"capsicum",
 "corn":"maize","bitter_melon":"bitter_gourd","karela":"bitter_gourd","calabash":"bottle_gourd","lauki":"bottle_gourd","chili":"chilli",
 "green_chili":"chilli","green_chilli":"chilli","mosambi":"green_orange","sweet_lime":"green_orange","tomatoes":"tomato","potatoes":"potato",
 "carrots":"carrot","onions":"onion","bananas":"banana","apples":"apple","grapes":"grape","cherries":"cherry","mangoes":"mango","oranges":"orange"}
items = {}
for k,d,e,c,r,f,ds,g,kc,cb,fb,vc,pr,tip in T:
    items[k]={"display":d,"emoji":e,"category":c,"shelf_life_days":{"room":r,"fridge":f},"default_storage":ds,"grams_per_item":g,
              "nutrition_per_100g":{"kcal":kc,"carbs_g":cb,"fiber_g":fb,"vitamin_c_mg":vc,"protein_g":pr},"tip":tip}
catalog={"version":1,"aliases":ALIASES,"items":items}

# id, title, minutes, servings, [(key,grams,optional)], staples, steps
R = [
("cabbage-carrot-stirfry","Cabbage & Carrot Stir-Fry",20,2,[("cabbage",200,0),("carrot",80,0),("chilli",5,1)],["oil","mustard seeds","turmeric","salt"],["Heat oil, crackle mustard seeds.","Add sliced chilli, carrot, then cabbage with turmeric and salt.","Stir-fry on high heat 6-8 min until crisp-tender."]),
("baingan-bharta","Baingan Bharta",35,3,[("eggplant",400,0),("onion",100,0),("tomato",120,0),("chilli",10,1),("ginger",10,1),("garlic",10,1)],["oil","cumin","salt"],["Roast the whole eggplant until the skin chars; peel and mash.","Saute onion, ginger, garlic, chilli, then tomato until soft.","Fold in the mash and cook 8 min."]),
("lauki-sabzi","Lauki Sabzi",25,3,[("bottle_gourd",400,0),("tomato",100,0),("ginger",10,1),("chilli",5,1)],["oil","cumin","turmeric","salt"],["Temper cumin in oil; add ginger and chilli.","Add tomato and diced gourd with turmeric and salt.","Cover and cook 12-15 min until soft."]),
("karela-fry","Karela Fry",25,2,[("bitter_gourd",200,0),("onion",80,0)],["oil","salt","turmeric","amchur"],["Slice karela, salt it for 15 min and squeeze out the bitterness.","Fry onions, add karela and spices.","Cook uncovered until crisp."]),
("aloo-gobi","Aloo Gobi",30,3,[("potato",250,0),("cauliflower",250,0),("tomato",100,0),("ginger",10,1),("chilli",5,1)],["oil","cumin","turmeric","coriander powder","salt"],["Saute cumin, ginger, chilli, tomato.","Add potato and cauliflower with spices and a splash of water.","Cover and cook 15-18 min."]),
("fruit-salad","Fresh Fruit Salad",10,2,[("apple",150,0),("banana",120,0),("grape",100,1),("kiwi",75,1),("green_orange",100,1)],["lemon juice","chaat masala (optional)"],["Chop all fruit into bite-size pieces.","Toss with lemon juice.","Serve chilled."]),
("mango-banana-smoothie","Mango-Banana Smoothie",5,2,[("mango",200,0),("banana",120,0)],["milk or curd","honey"],["Blend mango, banana and milk until smooth.","Sweeten to taste and serve cold."]),
("beet-carrot-salad","Beet & Carrot Salad",15,2,[("beetroot",160,0),("carrot",140,0),("cucumber",100,1),("lemon",30,1)],["salt","black pepper","roasted cumin"],["Grate beetroot and carrot.","Add sliced cucumber, lemon juice and spices.","Toss and rest 5 min."]),
("cucumber-raita","Cucumber Raita",10,3,[("cucumber",200,0),("onion",40,1),("chilli",5,1)],["curd","roasted cumin","salt"],["Grate cucumber and squeeze lightly.","Whisk into curd with onion, chilli, cumin and salt."]),
("stuffed-capsicum","Stuffed Capsicum",40,3,[("capsicum",300,0),("potato",200,0),("onion",50,0),("chilli",5,1)],["oil","cumin","garam masala","salt"],["Boil and mash the potato; mix with sauteed onion and spices.","Hollow the capsicums and stuff.","Pan-cook covered 12-15 min, turning once."]),
("tomato-soup","Tomato Soup",30,3,[("tomato",400,0),("onion",80,0),("carrot",60,1),("ginger",10,1),("garlic",10,1)],["butter or oil","salt","black pepper"],["Saute onion, garlic and ginger; add chopped tomato and carrot.","Simmer 15 min, then blend.","Season and serve hot."]),
("pumpkin-sabzi","Pumpkin Sabzi",25,3,[("pumpkin",400,0),("chilli",5,1),("ginger",10,1)],["oil","fenugreek seeds","turmeric","salt","jaggery (pinch)"],["Temper fenugreek seeds; add ginger and chilli.","Add cubed pumpkin, turmeric and salt.","Cover-cook 15 min, mash lightly."]),
("corn-chaat","Corn Chaat",15,2,[("maize",300,0),("onion",40,0),("tomato",60,0),("lemon",20,1),("chilli",5,1)],["butter","chaat masala","salt"],["Boil corn kernels 8 min.","Toss with onion, tomato, chilli and spices.","Finish with lemon."]),
("ginger-carrot-soup","Ginger-Carrot Soup",30,3,[("carrot",300,0),("ginger",15,0),("onion",60,0)],["oil","salt","black pepper"],["Saute onion and ginger; add chopped carrot and water.","Simmer 18 min, blend smooth, season."]),
("coconut-chutney","Coconut Chutney",10,4,[("coconut",150,0),("chilli",10,0),("ginger",10,1)],["salt","curd or water","mustard seeds"],["Grind coconut, chilli, ginger and salt with a little water.","Temper mustard seeds and pour over."]),
("veg-pulao","Vegetable Pulao",35,3,[("cauliflower",150,0),("carrot",80,0),("capsicum",80,1),("onion",60,0)],["rice","oil","whole spices","salt"],["Saute onion and whole spices; add vegetables.","Add washed rice and water (1:1.75).","Cook covered 15 min, rest 5."]),
("palak-aloo","Palak Aloo",25,3,[("spinach",300,0),("potato",150,0),("onion",60,0),("garlic",10,1),("tomato",80,1)],["oil","cumin","salt"],["Boil potato cubes; blanch spinach and puree.","Saute onion, garlic, tomato; add puree and potato.","Simmer 8 min."]),
("pineapple-salsa","Pineapple Salsa",10,3,[("pineapple",200,0),("onion",40,0),("chilli",5,0),("tomato",80,1)],["lemon juice","salt","coriander"],["Dice everything finely.","Mix with lemon juice and salt; rest 10 min."]),
]
recipes=[{"id":i,"title":t,"time_min":m,"servings":s,"ingredients":[{"key":k,"grams":g,"optional":bool(o)} for k,g,o in ing],"staples":st,"steps":steps} for i,t,m,s,ing,st,steps in R]

for rel in ["shared","backend/app/data","mobile/src/data"]:
    p=ROOT/rel; p.mkdir(parents=True,exist_ok=True)
    (p/"produce_catalog.json").write_text(json.dumps(catalog,ensure_ascii=False,indent=1))
    (p/"recipes.json").write_text(json.dumps(recipes,ensure_ascii=False,indent=1))
missing=[ing["key"] for r in recipes for ing in r["ingredients"] if ing["key"] not in items]
print("catalog",len(items),"recipes",len(recipes),"unknown recipe keys:",set(missing))
