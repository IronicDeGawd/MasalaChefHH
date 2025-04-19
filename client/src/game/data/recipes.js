// Recipe data with steps and requirements
const recipes = {
  alooBhujia: {
    name: 'Aloo Bhujia',
    description: 'A delicious spiced potato dish',
    prepTime: '20 minutes',
    cookingTime: '15 minutes',
    difficulty: 'Easy',
    steps: [
      {
        id: 1,
        description: 'Wash potatoes thoroughly',
        item: 'potato-raw',
        action: 'wash',
        options: []
      },
      {
        id: 2,
        description: 'Peel the potatoes',
        item: 'potato-raw',
        action: 'peel',
        options: [],
        resultItem: 'potato-peeled'
      },
      {
        id: 3,
        description: 'Dice the potatoes into small cubes',
        item: 'potato-peeled',
        action: 'chop',
        options: ['fine', 'medium', 'rough'],
        correctOption: 'medium',
        resultItem: 'potato-diced'
      },
      {
        id: 4,
        description: 'Place pan on stove',
        item: 'pan',
        action: 'place',
        targetItem: 'stove',
        options: []
      },
      {
        id: 5,
        description: 'Set stove to medium heat',
        item: 'stove',
        action: 'heat',
        options: ['low', 'medium', 'high'],
        correctOption: 'medium'
      },
      {
        id: 6,
        description: 'Add 2 tablespoons of oil to the pan',
        item: 'oil',
        action: 'add',
        options: ['1 tablespoon', '2 tablespoons', '3 tablespoons'],
        correctOption: '2 tablespoons'
      },
      {
        id: 7,
        description: 'Add cumin seeds (jeera) to the hot oil',
        item: 'container',
        itemName: 'Cumin Seeds',
        action: 'add',
        options: ['1/2 teaspoon', '1 teaspoon', '2 teaspoons'],
        correctOption: '1 teaspoon'
      },
      {
        id: 8,
        description: 'Add the diced potatoes to the pan',
        item: 'potato-diced',
        action: 'add',
        targetItem: 'pan',
        options: []
      },
      {
        id: 9,
        description: 'Add turmeric (haldi)',
        item: 'container2',
        itemName: 'Turmeric',
        action: 'add',
        options: ['1/4 teaspoon', '1/2 teaspoon', '1 teaspoon'],
        correctOption: '1/2 teaspoon'
      },
      {
        id: 10,
        description: 'Add red chili powder',
        item: 'container-big',
        itemName: 'Red Chili Powder',
        action: 'add',
        options: ['1/2 teaspoon', '1 teaspoon', '2 teaspoons'],
        correctOption: '1 teaspoon'
      },
      {
        id: 11,
        description: 'Add salt to taste',
        item: 'salt',
        action: 'add',
        options: ['1/2 teaspoon', '1 teaspoon', '2 teaspoons'],
        correctOption: '1 teaspoon'
      },
      {
        id: 12,
        description: 'Stir the potatoes to mix all spices',
        item: 'mixingSpoon',
        action: 'stir',
        options: ['gentle', 'medium', 'vigorous'],
        correctOption: 'medium'
      },
      {
        id: 13,
        description: 'Cook for 10-15 minutes, stirring occasionally',
        item: 'mixingSpoon',
        action: 'cook',
        options: ['5 minutes', '10 minutes', '15 minutes'],
        correctOption: '10 minutes',
        resultItem: 'potato-cooked'
      }
    ]
  },
  palakPaneer: {
    name: 'Palak Paneer',
    description: 'Coming soon!'
    // Steps will be added in future updates
  }
};

export default recipes; 