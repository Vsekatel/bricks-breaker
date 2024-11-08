const levels = [];

class Brick {
    constructor(x, strength) {
        this.x = x;
        this.y = 0;
        this.strength = strength;
    }
}

class Level {
    constructor(data) {
        this.id = data.id;
        for (let i = 0; i < data.rows.length; i++) {
            const row = [];
            const rowData = data.rows[i];
            for (let j = 0; j < row.length; j++) {
                const brickData = row[j];
                row.push(new Brick(brickData.x, brickData.strength));
            }
            this.rows.push(row);
        }
    }

    nextRow() {
        return this.rows.shift();
    }

    getInitialRowsCount() {
        let counter = 0;
        for (let i = 0; i < this.rows.length; i++) {
            if (this.rows[i].isInitial)
                counter ++;
            else
                break;
        }
        return counter;
    }
}
async function createLevelsFromJSON(url) {
    const response = await fetch(url);
    const data = await response.json();
    for (let i = 0; i < data.levels.length; i++) {
        const levelData = data.levels[i];
        levels.push(new Level(levelData));
    }
}


// Инициализация уровней
createLevelsFromJSON('levels.json');