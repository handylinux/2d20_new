// originsData.js
export const ORIGINS = [
  {
    id: 1,
    name: "Братство Стали",
    image: require('../../../../assets/origins/brotherhood_of_steel.png'),
    equipmentKits: [
      {
        name: 'Комплект Посвященного',
        clothing: [
          { type: 'fixed', name: 'Униформа Братства Стали' },
        ],
        armor: [
          { type: 'fixed', name: 'Капюшон Братства Стали' },
        ],
        weapons: [
          { type: 'fixed', name: 'Боевой нож', weaponId: 'weapon_029' },
          {
            type: 'choice',
            options: [
              { name: 'Лазерный пистолет', ammunition: '10+5fn{CD} <ammo>', weaponId: 'weapon_018' },
              { name: '10-мм Пистолет', ammunition: '10+5fn{CD} <ammo>', weaponId: 'weapon_002' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Голографические жетоны' }
        ]
      },
      {
        name: 'Комплект Писца',
        clothing: [
          { type: 'fixed', name: 'Доспехи писца Братства' },
        ],
        armor: [
          { type: 'fixed', name: 'Шляпа писца' },
        ],
        weapons: [
          { type: 'fixed', name: 'Боевой нож', weaponId: 'weapon_029' },
          {
            type: 'choice',
            options: [
              { name: 'Лазерный пистолет', ammunition: '6+3fn{CD} <ammo>', weaponId: 'weapon_018' },
              { name: '10-мм Пистолет', ammunition: '6+3fn{CD} <ammo>', weaponId: 'weapon_002' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Голографические жетоны' }
        ]
      }
    ],
  },
  {
    id: 2,
    name: "Житель НКР",
    image: require('../../../../assets/origins/ncr_citizen.png'),
    equipmentKits: [
      {
        name: 'Пехотинец',
        clothing: [
          { type: 'fixed', name: 'Военная форма' }
        ],
        armor: [
          { type: 'fixed', name: 'Армейский шлем' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Боевой карабин', ammunition: '8+4fn{CD}<ammo>', weaponId: 'weapon_005' },
              { name: 'Боевой дробовик', ammunition: '6+3fn{CD}<ammo>', weaponId: 'weapon_009' }
            ]
          },
          {
            type: 'choice',
            options: [
              { name: '10-мм Пистолет', ammunition: '8+4fn{CD}<ammo>', weaponId: 'weapon_002' },
              { name: 'Боевой нож', weaponId: 'weapon_029' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'Очищенная вода', itemType: 'chem' },
          { type: 'fixed', name: '5+5fn{CD} долларов НКР' }
        ]
      },
      {
        name: 'Багровый караванщик',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        armor: [
          {
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              {
                group: [
                  { type: 'fixed', name: 'Кожаный Наруч' },
                  { type: 'fixed', name: 'Кожаный Понож' }
                ]
              }
            ]
          }
        ],
        weapons: [
          { type: 'fixed', name: 'Двуствольный дробовик', ammunition: '6+3fn{CD}<ammo>', weaponId: 'weapon_010' },
          {
            type: 'choice',
            options: [
              { name: 'Боевой нож', weaponId: 'weapon_029' },
              {
                group: [
                  { type: 'fixed', name: 'Кастет', weaponId: 'weapon_048' },
                  { type: 'fixed', name: 'Кастет', weaponId: 'weapon_048' }
                ]
              }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Вьючный брамин' },
          { type: 'fixed', name: 'd20<trinklet>' },
          // Для совместимости без изменения логики RandomLootLogic.js —
          // раскладываем в три и два независимых броска соответственно
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<brewery>' },
          { type: 'fixed', name: 'd20<brewery>' },
          { type: 'fixed', name: 'колода карт' },
          { type: 'fixed', name: '2d20 долларов НКР' }
        ]
      },
      {
        name: 'Меткий стрелок',
        clothing: [
          { type: 'fixed', name: 'Военная форма' }
        ],
        armor: [
          { type: 'fixed', name: 'Армейский шлем' }
        ],
        weapons: [
          { type: 'fixed', name: 'Охотничья винтовка', weaponId: 'weapon_007', modCodes: ['power_receiver_plus', 'long_optic_sight'], ammunition: '6+3fn{CD}<ammo>' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Спокойствие', itemType: 'chem' },
          { type: 'fixed', name: 'Руководство по Тайным Операции США' }
        ]
      }
    ],
  },
  {
    id: 3,
    name: "Минитмен",
    image: require('../../../../assets/origins/minuteman.png'),
    equipmentKits: [
      {
        name: 'Стрелок',
        clothing: [
          { type: 'fixed', name: 'Повседневная одежда' },
          { type: 'fixed', name: 'Обычная шляпа' }
        ],
        armor: [
          {
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              { name: 'Кожаный Наруч' }
            ]
          }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Лазерный Мушкет', ammunition: '14+7fn{CD}<ammo>', weaponId: 'weapon_017' },
              { name: 'Охотничья винтовка', ammunition: '6+3fn{CD}<ammo>', weaponId: 'weapon_007' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: '2d20<food>' },
          { type: 'fixed', name: '2d20<food>' },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '5<caps>' }
        ]
      },
      {
        name: 'Застрельщик',
        clothing: [
          { type: 'fixed', name: 'Повседневная одежда' }
        ],
        armor: [
          { type: 'fixed', name: 'Армейский шлем' },
          { type: 'fixed', name: 'Металлический Нагрудник' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Двуствольный дробовик', ammunition: '6+3fn{CD}<ammo>', weaponId: 'weapon_010' },
              { name: 'Пистолет-пулемёт Томпсона', ammunition: '8+4fn{CD}<ammo>', weaponId: 'weapon_008' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<chem>', itemType: 'chem' },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '5<caps>' }
        ]
      }
    ],
  },
  {
    id: 4,
    name: "Дитя Атома",
    image: require('../../../../assets/origins/child_of_atom.png'),
    description: "Поклонники атомной энергии",
    equipmentKits: [
      {
        name: 'Миссионер',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        weapons: [
          { type: 'fixed', name: 'Трость', weaponId: 'weapon_045' },
          { type: 'fixed', name: 'Гамма-пушка', ammunition: '4+2fn{CD}<ammo>', weaponId: 'weapon_020' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Стим-пак', itemType: 'chem' },
          { type: 'fixed', name: '10<caps>' },
          { type: 'fixed', name: 'd20<food>' }
        ]
      },
      {
        name: 'Зилот',
        clothing: [
          {
            type: 'choice',
            options: [
              { name: 'Прочная одежда' },
              { name: 'Костюм бродяги' }
            ]
          }
        ],
        armor: [
          { type: 'fixed', name: 'Противогаз' }
        ],
        weapons: [
          { type: 'fixed', name: 'Мачете', weaponId: 'weapon_030' },
          { type: 'fixed', name: 'Гамма-пушка', ammunition: '4+2fn{CD}<ammo>', weaponId: 'weapon_020' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Обитатель убежища",
    image: require('../../../../assets/origins/vault_dweller.png'),
    description: "Жители подземных убежищ",
  },
  {
    id: 6,
    name: "Протектрон",
    image: require('../../../../assets/origins/protectron.png'),
    description: "Старые роботы-охранники",
    special: "robot",
  },
  {
    id: 7,
    name: "Выживший",
    image: require('../../../../assets/origins/survivor.png'),
    description: "Одиночки, выжившие в пустошах",
    equipmentKits: [
      {
        name: 'Наемник',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        armor: [
          {
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              {
                group: [
                  { type: 'fixed', name: 'Кожаный Наруч' },
                  { type: 'fixed', name: 'Кожаный Понож' },
                ]
              }
            ]
          }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Бейсбольная бита', weaponId: 'weapon_034' },
              { name: 'Балонный ключ', weaponId: 'weapon_044' }
            ]
          },
          {
            type: 'choice',
            options: [
              { name: '10-мм Пистолет', ammunition: '10+5fn{CD}<ammo>', weaponId: 'weapon_002' },
              { name: 'Револьвер Калибра .44', ammunition: '10+5fn{CD}<ammo>', weaponId: 'weapon_001' },
              { name: 'Охотничья винтовка', ammunition: '10+5fn{CD}<ammo>', weaponId: 'weapon_007' },
              { name: 'Гладкоствольный пистолет', ammunition: '10+5fn{CD}<ammo>', weaponId: 'weapon_012' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Объявление о работе в соседнем поселении с наградой в 50 крышек' },
          { type: 'fixed', name: '15<caps>' }
        ]
      },
      {
        name: 'Поселенец',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Выкидной нож', weaponId: 'weapon_033' },
              { name: 'Разводной ключ', weaponId: 'weapon_038' },
              { name: 'Скалка', weaponId: 'weapon_040' },
              { name: 'Кастет', weaponId: 'weapon_048' }
            ]
          },
          {
            type: 'fixed',
            name: 'Гладкоствольный пистолет',
            ammunition: '6+3fn{CD}<ammo>',
            weaponId: 'weapon_012'
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '45<caps>' }
        ]
      },
      {
        name: 'Путешественник',
        clothing: [
          { type: 'fixed', name: 'Костюм бродяги' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Выкидной нож', weaponId: 'weapon_033' },
              { name: 'Разводной ключ', weaponId: 'weapon_038' },
              { name: 'Скалка', weaponId: 'weapon_040' },
              { name: 'Кастет', weaponId: 'weapon_048' }
            ]
          },
          {
            type: 'fixed',
            name: 'Гладкоствольный пистолет',
            ammunition: '8+4fn{CD}<ammo>',
            weaponId: 'weapon_012'
          }
        ],
        miscellaneous: [
          {
            type: 'choice',
            options: [
              { name: 'Винт', itemType: 'chem' },
              { name: 'Антирадин', itemType: 'chem' }
            ]
          },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '30<caps>' }
        ]
      },
      {
        name: 'Рейдер',
        clothing: [
          { type: 'fixed', name: 'Панталоны' }
        ],
        armor: [
          { type: 'fixed', name: 'Рейдерский Нагрудник' },
          { type: 'fixed', name: 'Рейдерский Наруч' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Саницовая труба', weaponId: 'weapon_037' },
              { name: 'Бильярдный кий', weaponId: 'weapon_039' },
              { name: 'Балонный ключ', weaponId: 'weapon_044' }
            ]
          },
          {
            type: 'fixed',
            name: 'Гладкоствольный пистолет',
            ammunition: '10+5fn{CD}<ammo>',
            weaponId: 'weapon_012'
          }
        ],
        miscellaneous: [
          {
            type: 'choice',
            options: [
              { name: 'Винт', itemType: 'chem' },
              { name: 'Антирадин', itemType: 'chem' }
            ]
          },
          {
            type: 'choice',
            options: [
              { name: 'Коктейль Молотова' },
              { name: 'Стим-пак', itemType: 'chem' }
            ]
          },
          { type: 'fixed', name: '15<caps>' }
        ]
      },
      {
        name: 'Торговец',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        armor: [
          {
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              {
                group: [
                  { name: 'Кожаный Наруч' },
                  { name: 'Кожаный Понож' }
                ]
              }
            ]
          }
        ],
        weapons: [
          {
            type: 'fixed',
            name: 'Гладкоствольный пистолет',
            ammunition: '8+4fn{CD}<ammo>',
            weaponId: 'weapon_012'
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '3 броска по таблицам добычи' },
          { type: 'fixed', name: 'Вьючный брамин' },
          { type: 'fixed', name: '50<caps>' }
        ]
      }
    ],
  },
  {
    id: 8,
    name: "Секьюритрон",
    image: require('../../../../assets/origins/securitron.png'),
    description: "Боевые роботы с продвинутым вооружением",
    special: "robot",
  },
  {
    id: 9,
    name: "Гуль",
    image: require('../../../../assets/origins/ghoul.png'),
    description: "Мутанты, устойчивые к радиации",
    equipmentKits: [
      {
        name: 'Наемник',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        armor: [
          {
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              {
                group: [
                  { type: 'fixed', name: 'Кожаный Наруч' },
                  { type: 'fixed', name: 'Кожаный Понож' },
                ]
              }
            ]
          }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Бейсбольная бита', weaponId: 'weapon_034' },
              { name: 'Балонный ключ', weaponId: 'weapon_044' }
            ]
          },
          {
            type: 'choice',
            options: [
              { name: '10-мм Пистолет', ammunition: '10+5fn{CD}<ammo>', weaponId: 'weapon_002' },
              { name: 'Револьвер Калибра .44', ammunition: '10+5fn{CD}<ammo>', weaponId: 'weapon_001' },
              { name: 'Охотничья винтовка', ammunition: '10+5fn{CD}<ammo>', weaponId: 'weapon_007' },
              { name: 'Гладкоствольный пистолет', ammunition: '10+5fn{CD}<ammo>', weaponId: 'weapon_012' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Объявление о работе в соседнем поселении с наградой в 50 крышек' },
          { type: 'fixed', name: '15<caps>' }
        ]
      },
      {
        name: 'Поселенец',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Выкидной нож', weaponId: 'weapon_033' },
              { name: 'Разводной ключ', weaponId: 'weapon_038' },
              { name: 'Скалка', weaponId: 'weapon_040' },
              { name: 'Кастет', weaponId: 'weapon_048' }
            ]
          },
          {
            type: 'fixed',
            name: 'Гладкоствольный пистолет',
            ammunition: '6+3fn{CD}<ammo>'
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '45<caps>' }
        ]
      },
      {
        name: 'Путешественник',
        clothing: [
          { type: 'fixed', name: 'Костюм бродяги' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Выкидной нож', weaponId: 'weapon_033' },
              { name: 'Разводной ключ', weaponId: 'weapon_038' },
              { name: 'Скалка', weaponId: 'weapon_040' },
              { name: 'Кастет', weaponId: 'weapon_048' }
            ]
          },
          {
            type: 'fixed',
            name: 'Гладкоствольный пистолет',
            ammunition: '8+4fn{CD}<ammo>'
          }
        ],
        miscellaneous: [
          {
            type: 'choice',
            options: [
              { name: 'Винт', itemType: 'chem' },
              { name: 'Антирадин', itemType: 'chem' }
            ]
          },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '30<caps>' }
        ]
      },
      {
        name: 'Рейдер',
        clothing: [
          { type: 'fixed', name: 'Панталоны' }
        ],
        armor: [
          { type: 'fixed', name: 'Рейдерский Нагрудник' },
          { type: 'fixed', name: 'Рейдерский Наруч' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { name: 'Саницовая труба', weaponId: 'weapon_037' },
              { name: 'Бильярдный кий', weaponId: 'weapon_039' },
              { name: 'Балонный ключ', weaponId: 'weapon_044' }
            ]
          },
          {
            type: 'fixed',
            name: 'Гладкоствольный пистолет',
            ammunition: '10+5fn{CD}<ammo>'
          }
        ],
        miscellaneous: [
          {
            type: 'choice',
            options: [
              { name: 'Винт', itemType: 'chem' },
              { name: 'Антирадин', itemType: 'chem' }
            ]
          },
          {
            type: 'choice',
            options: [
              { name: 'Коктейль Молотова' },
              { name: 'Стим-пак', itemType: 'chem' }
            ]
          },
          { type: 'fixed', name: '15<caps>' }
        ]
      },
      {
        name: 'Торговец',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        armor: [
          {
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              {
                group: [
                  { name: 'Кожаный Наруч' },
                  { name: 'Кожаный Понож' }
                ]
              }
            ]
          }
        ],
        weapons: [
          {
            type: 'fixed',
            name: 'Гладкоствольный пистолет',
            ammunition: '8+4fn{CD}<ammo>'
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '3 броска по таблицам добычи' },
          { type: 'fixed', name: 'Вьючный брамин' },
          { type: 'fixed', name: '50<caps>' }
        ]
      }
    ]
  },
  {
    id: 10,
    name: "Штурмотрон",
    image: require('../../../../assets/origins/assaultron.png'),
    description: "Элитные боевые роботы с ближним боем",
    special: "robot",
  },
  {
    id: 11,
    name: "Супермутант",
    image: require('../../../../assets/origins/super_mutant.png'),
    description: "Мощные мутанты с огромной силой",
    equipmentKits: [
      {
        name: "Громила",
        armor: [
          { type: 'fixed', name: 'Рейдерский Нагрудник' },
          {
            type: 'choice',
            options: [
              { name: 'Рейдерский Наруч' },
              { name: 'Рейдерский Понож' }
            ]
          }
        ],
        weapons: [
          {
            type: 'fixed',
            name: 'Гладкоствольный карабин',
            ammunition: '6+3fn{CD}<ammo>'
          },
          {
            type: 'choice',
            options: [
              { name: 'Бейсбольная бита', weaponId: 'weapon_034' },
              { name: 'Мачете', weaponId: 'weapon_030' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '5<caps>' }
        ]
      },
      {
        name: "Застрельщик",
        armor: [
          { type: 'fixed', name: 'Рейдерский Нагрудник' },
          {
            type: 'choice',
            options: [
              { name: 'Рейдерский Наруч' },
              { name: 'Рейдерский Понож' }
            ]
          }
        ],
        weapons: [
          {
            type: 'fixed',
            name: 'Усиленный гладкоствольный карабин с болтовым затвором',
            ammunition: '8+4fn{CD}<ammo>'
          },
          { type: 'fixed', name: 'Дрын', weaponId: 'weapon_036' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '5<caps>' }
        ]
      }
    ],
  },
  {
    id: 12,
    name: "Мистер Помощник",
    image: require('../../../../assets/origins/mister_handy.png'),
    description: "Универсальные сервисные роботы",
    special: "robot",
  },
  {
    id: 13,
    name: "Изгой Братства Стали",
    image: require('../../../../assets/origins/brotherhood_outcast.png'),
    description: "Отвергнутые члены Братства",
    equipmentKits: [
      {
        name: 'Бывший рыцарь',
        clothing: [
          { type: 'fixed', name: 'Униформа Братства Стали' },
          { type: 'fixed', name: 'Очищенная вода', itemType: 'chem' }
        ],
        weapons: [
          { type: 'fixed', name: 'Лазерный Мушкет', ammunition: '8+6fn{CD}<ammo>', weaponId: 'weapon_017' }
        ],
        loot: [
          { type: 'fixed', name: 'd20<outcast>' },
          { type: 'fixed', name: 'd20<outcast>' }
        ],
        miscellaneous: [
          { type: 'fixed', name: '10<caps>' }
        ]
      },
      {
        name: 'Бывший писец',
        armor: [
          { type: 'fixed', name: 'Поношенная броня писца Братства' }
        ],
        weapons: [
          { type: 'fixed', name: 'Лазерный пистолет', ammunition: '8+4fn{CD}<ammo>', weaponId: 'weapon_018' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Мультитул' }
        ],
        loot: [
          { type: 'fixed', name: 'd20<outcast>' },
          { type: 'fixed', name: 'd20<outcast>' },
          { type: 'fixed', name: 'd20<outcast>' },
          { type: 'fixed', name: '15<caps>' }
        ]
      }
    ],
  },
  {
    id: 14,
    name: "Тень",
    image: require('../../../../assets/origins/shadow.png'),
    description: "Таинственные агенты подполья",
  },
  {
    id: 15,
    name: "Синт",
    image: require('../../../../assets/origins/synth.png'),
    description: "Продвинутые андроиды",
  },
 {
  id: 16,
  name: "Робомозг",
  image: require('../../../../assets/origins/robobrain.png'),
  description: "Роботы с человеческим мозгом",
  special: "robot",
  immunity: {
    radiation: true,
    poison: true
  },
  equipmentKits: [
    {
      name: 'Сервомеханизмы',
      clothing: [
        {
          type: 'choice',
          options: [
            { name: 'Повседневная шляпа' },
            { name: 'Формальная шляпа' }
          ]
        }
      ],
      weapons: [
        { type: 'fixed', name: 'Винтовка Теслы', weaponId: 'weapon_068', ammunition: '14+7fn{CD}<ammo>' },
        { type: 'fixed', name: 'Гипнотрон', weaponId: 'weapon_067', ammunition: '14+7fn{CD}<ammo>' },
        { type: 'fixed', name: 'Дымовой манипулятор', weaponId: 'weapon_102' }
      ],
      miscellaneous: [
        { type: 'fixed', name: 'Ремкомплект для роботов' },
        { type: 'fixed', name: 'Ремкомплект для роботов' },
        { type: 'fixed', name: 'd20<trinklet>' }
      ]
    },
    {
      name: 'Модель армии США',
      armor: [
        { type: 'fixed', name: 'Заводская броня (Торс)' },
        { type: 'fixed', name: 'Заводская броня (Левая рука)' },
        { type: 'fixed', name: 'Заводская броня (Правая рука)' }
      ],
      weapons: [
        { type: 'fixed', name: 'Гипнотрон', weaponId: 'weapon_067', ammunition: '4+7fn{CD}<ammo>' },
        { type: 'fixed', name: 'Дымовой манипулятор', weaponId: 'weapon_102'},
        { type: 'fixed', name: 'Дымовой манипулятор', weaponId: 'weapon_102'},
        { type: 'fixed', name: 'Боевой карабин', weaponId: 'weapon_005', ammunition: '8+4fn{CD}<ammo>' }
      ]
    },
    {
      name: 'Неординарная личность',
      weapons: [
        { type: 'fixed', name: 'Гипнотрон', weaponId: 'weapon_067', ammunition: '12+6fn{CD}<ammo>' },
        {
          type: 'choice',
          options: [
            { name: 'Дымовой манипулятор', weaponId: 'weapon_102' },
            { name: 'Винтовка Теслы', weaponId: 'weapon_068', ammunition: '12+6fn{CD}<ammo>' },
            { name: 'Огнемёт', weaponId: 'weapon_022', ammunition: '12+6fn{CD}<ammo>' },
            { name: 'Лазерный пистолет', weaponId: 'weapon_018', ammunition: '14+7fn{CD}<ammo>' },
            { name: 'Кувалда', weaponId: 'weapon_042' }
          ],
          count: 2
        }
      ],
      miscellaneous: [
        { type: 'fixed', name: '2d20<trinklet>' },
        { type: 'fixed', name: '10<caps>' }
      ]
    }
  ]
},
  {
    id: 17,
    name: "Дикарь",
    image: require('../../../../assets/origins/savage.png'),
    description: "Племенные жители пустошей",
  }
];