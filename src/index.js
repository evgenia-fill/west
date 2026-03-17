import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Duck extends Card {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack')
    }

    swim() {
        console.log('float: both;')
    }

    // getDescriptions(){
    //     super.getDescriptions();
    // }
}

class Dog extends Card {
    constructor(name = 'Пес-бандит', power = 3) {
        super('Пес-бандит', 3);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(Math.max(value - 1, 0));
        });
    }

    getDescriptions() {
        super.getDescriptions();
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const oppositeTable = gameContext.oppositePlayer.table;

        for (let i = 0; i < oppositeTable.length; i++) {
            const card = oppositeTable[i];
            if (card) {
                taskQueue.push(onDone => {
                    card.takeDamage(2, this, gameContext, onDone);
                });
            }
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    static inGameCount = 0;

    constructor() {
        super('Браток', 2);
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    doAfterComingIntoPlay() {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
    }

    doBeforeRemoving() {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
    }

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }

    modifyDealedDamageToCreature(value, gameContext, continuation) {
        const bonus = Lad.getBonus();
        return super.modifyDealedDamageToCreature(value + bonus, gameContext, continuation);
    }

    modifyTakenDamage(value, from, gameContext, continuation) {
        const bonus = Lad.getBonus();
        return super.modifyTakenDamage(value - bonus, from, gameContext, continuation);
    }

    getDescriptions() {
        let descriptions = super.getDescriptions();

        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            descriptions.push('Чем их больше, тем они сильнее');
        }

        return descriptions;
    }
}

class Creature extends Card {
    constructor(name, maxPower) {
        super(name, maxPower);
    }
    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}

// Отвечает, является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});