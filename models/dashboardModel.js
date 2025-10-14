// model/dashboardModel.js
import db from '../config/db.js';
import cache from '../utils/cache.js';

class DashboardModel {
    // Buscar estatísticas gerais do sistema
    async buscarEstatisticasGerais() {
        // Verificar cache primeiro
        const cacheKey = 'estatisticas_gerais';
        const cached = cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const query = `
            SELECT 
                (SELECT COUNT(*) FROM cuidador) as TotalCuidadores,
                (SELECT COUNT(*) FROM responsavel) as TotalResponsaveis,
                (SELECT COUNT(*) FROM idoso) as TotalIdosos,
                (SELECT COUNT(*) FROM atendimento WHERE Status = 'Concluído') as AtendimentosConcluidos,
                (SELECT COUNT(*) FROM atendimento WHERE Status = 'Em Andamento') as AtendimentosEmAndamento,
                (SELECT COUNT(*) FROM atendimento WHERE Status = 'Agendado') as AtendimentosAgendados,
                (SELECT COUNT(*) FROM avaliacao) as TotalAvaliacoes,
                (SELECT AVG(Nota) FROM avaliacao) as MediaAvaliacoes
        `;
        
        try {
            const [rows] = await db.execute(query);
            const result = { success: true, data: rows[0] };
            
            // Cache por 2 minutos
            cache.set(cacheKey, result, 2 * 60 * 1000);
            
            return result;
        } catch (error) {
            console.error('Erro ao buscar estatísticas gerais:', error);
            return { success: false, message: 'Erro ao buscar estatísticas gerais' };
        }
    }

    // Buscar estatísticas financeiras
    async buscarEstatisticasFinanceiras() {
        const query = `
            SELECT 
                COALESCE(SUM(Valor), 0) as ReceitaTotal,
                COALESCE(AVG(Valor), 0) as ValorMedioAtendimento,
                (SELECT COUNT(*) FROM pagamento WHERE StatusPagamento = 'Pago') as PagamentosRealizados,
                (SELECT COUNT(*) FROM pagamento WHERE StatusPagamento = 'Pendente') as PagamentosPendentes,
                (SELECT COALESCE(SUM(at.Valor), 0) FROM atendimento at 
                 LEFT JOIN pagamento p ON at.IdAtendimento = p.IdAtendimento 
                 WHERE p.StatusPagamento = 'Pago' OR p.StatusPagamento IS NULL) as ReceitaMesAtual
            FROM atendimento 
            WHERE Status = 'Concluído'
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar estatísticas financeiras:', error);
            return { success: false, message: 'Erro ao buscar estatísticas financeiras' };
        }
    }

    // Buscar atendimentos por mês (últimos 12 meses)
    async buscarAtendimentosPorMes() {
        const query = `
            SELECT 
                DATE_FORMAT(DataInicio, '%Y-%m') as Mes,
                COUNT(*) as TotalAtendimentos,
                SUM(Valor) as ReceitaMes
            FROM atendimento 
            WHERE DataInicio >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            AND Status = 'Concluído'
            GROUP BY DATE_FORMAT(DataInicio, '%Y-%m')
            ORDER BY Mes ASC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar atendimentos por mês:', error);
            return { success: false, message: 'Erro ao buscar atendimentos por mês' };
        }
    }

    // Buscar cuidadores mais ativos
    async buscarCuidadoresMaisAtivos() {
        const query = `
            SELECT 
                c.IdCuidador,
                c.Nome,
                COUNT(a.IdAtendimento) as TotalAtendimentos,
                COALESCE(AVG(av.Nota), 0) as MediaAvaliacao,
                COALESCE(SUM(a.Valor), 0) as ReceitaGerada
            FROM cuidador c
            LEFT JOIN atendimento a ON c.IdCuidador = a.IdCuidador AND a.Status = 'Concluído'
            LEFT JOIN avaliacao av ON c.IdCuidador = av.IdCuidador
            GROUP BY c.IdCuidador, c.Nome
            ORDER BY TotalAtendimentos DESC, MediaAvaliacao DESC
            LIMIT 10
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar cuidadores mais ativos:', error);
            return { success: false, message: 'Erro ao buscar cuidadores mais ativos' };
        }
    }

    // Buscar distribuição de idosos por nível de autonomia
    async buscarDistribuicaoAutonomia() {
        const query = `
            SELECT 
                na.Descricao as NivelAutonomia,
                COUNT(i.IdIdoso) as TotalIdosos
            FROM nivelautonomia na
            LEFT JOIN idoso i ON na.IdNivelAutonomia = i.IdNivelAutonomia
            GROUP BY na.IdNivelAutonomia, na.Descricao
            ORDER BY na.IdNivelAutonomia
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar distribuição de autonomia:', error);
            return { success: false, message: 'Erro ao buscar distribuição de autonomia' };
        }
    }

    // Buscar distribuição de idosos por mobilidade
    async buscarDistribuicaoMobilidade() {
        const query = `
            SELECT 
                m.Descricao as TipoMobilidade,
                COUNT(i.IdIdoso) as TotalIdosos
            FROM mobilidade m
            LEFT JOIN idoso i ON m.IdMobilidade = i.IdMobilidade
            GROUP BY m.IdMobilidade, m.Descricao
            ORDER BY m.IdMobilidade
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar distribuição de mobilidade:', error);
            return { success: false, message: 'Erro ao buscar distribuição de mobilidade' };
        }
    }

    // Buscar avaliações por nota
    async buscarDistribuicaoAvaliacoes() {
        const query = `
            SELECT 
                Nota,
                COUNT(*) as TotalAvaliacoes
            FROM avaliacao
            GROUP BY Nota
            ORDER BY Nota DESC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar distribuição de avaliações:', error);
            return { success: false, message: 'Erro ao buscar distribuição de avaliações' };
        }
    }

    // Buscar atendimentos por status
    async buscarAtendimentosPorStatus() {
        const query = `
            SELECT 
                Status,
                COUNT(*) as Total
            FROM atendimento
            GROUP BY Status
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar atendimentos por status:', error);
            return { success: false, message: 'Erro ao buscar atendimentos por status' };
        }
    }

    // Buscar dados para gráfico de linha (atendimentos por dia - últimos 30 dias)
    async buscarAtendimentosPorDia() {
        const query = `
            SELECT 
                DATE(DataInicio) as Data,
                COUNT(*) as TotalAtendimentos
            FROM atendimento
            WHERE DataInicio >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(DataInicio)
            ORDER BY Data ASC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar atendimentos por dia:', error);
            return { success: false, message: 'Erro ao buscar atendimentos por dia' };
        }
    }

    // Buscar especialidades mais procuradas
    async buscarEspecialidadesMaisProcuradas() {
        const query = `
            SELECT 
                e.Nome as Especialidade,
                COUNT(ce.IdCuidadorEspecialidade) as TotalCuidadores
            FROM especialidade e
            LEFT JOIN cuidadorespecialidade ce ON e.IdEspecialidade = ce.IdEspecialidade
            GROUP BY e.IdEspecialidade, e.Nome
            ORDER BY TotalCuidadores DESC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar especialidades mais procuradas:', error);
            return { success: false, message: 'Erro ao buscar especialidades mais procuradas' };
        }
    }

    // Buscar dados de crescimento (comparação mês atual vs anterior)
    async buscarDadosCrescimento() {
        const query = `
            SELECT 
                'Atendimentos' as Metrica,
                (SELECT COUNT(*) FROM atendimento 
                 WHERE MONTH(DataInicio) = MONTH(NOW()) 
                 AND YEAR(DataInicio) = YEAR(NOW())) as MesAtual,
                (SELECT COUNT(*) FROM atendimento 
                 WHERE MONTH(DataInicio) = MONTH(NOW()) - 1 
                 AND YEAR(DataInicio) = YEAR(NOW())) as MesAnterior
            UNION ALL
            SELECT 
                'Receita' as Metrica,
                (SELECT COALESCE(SUM(Valor), 0) FROM atendimento 
                 WHERE MONTH(DataInicio) = MONTH(NOW()) 
                 AND YEAR(DataInicio) = YEAR(NOW()) 
                 AND Status = 'Concluído') as MesAtual,
                (SELECT COALESCE(SUM(Valor), 0) FROM atendimento 
                 WHERE MONTH(DataInicio) = MONTH(NOW()) - 1 
                 AND YEAR(DataInicio) = YEAR(NOW()) 
                 AND Status = 'Concluído') as MesAnterior
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar dados de crescimento:', error);
            return { success: false, message: 'Erro ao buscar dados de crescimento' };
        }
    }
}

export default new DashboardModel();
