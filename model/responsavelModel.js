const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

const Responsavel = {
    async listar() {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT IdResponsavel, Nome FROM Responsavel ORDER BY Nome');
        await connection.end();
        return rows;
    }
};

export default Responsavel;
