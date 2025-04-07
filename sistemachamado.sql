-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 07/04/2025 às 20:13
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `sistemachamado`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `chamados`
--

CREATE TABLE `chamados` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `contato` varchar(255) NOT NULL,
  `setor` varchar(100) NOT NULL,
  `descricao` text NOT NULL,
  `arquivo` longblob DEFAULT NULL,
  `ativo` varchar(1) DEFAULT 'S',
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `arquivo_nome` varchar(255) DEFAULT NULL,
  `arquivo_extensao` varchar(10) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `data_conclusao` datetime DEFAULT NULL,
  `desc_conclusao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `chamados`
--

INSERT INTO `chamados` (`id`, `nome`, `contato`, `setor`, `descricao`, `arquivo`, `ativo`, `data_criacao`, `arquivo_nome`, `arquivo_extensao`, `status`, `data_conclusao`, `desc_conclusao`) VALUES
(1, 'Pedro ', 'pedroarthurbds13@gmail.com', 'RH', '1', NULL, 'S', '2025-04-07 18:12:42', NULL, NULL, 1, NULL, NULL);

--
-- Acionadores `chamados`
--
DELIMITER $$
CREATE TRIGGER `after_chamados_status_update` BEFORE UPDATE ON `chamados` FOR EACH ROW BEGIN
    -- When status is changed to Concluído (3)
    IF NEW.status = 3 AND OLD.status != 3 THEN
        SET NEW.data_conclusao = CURRENT_TIMESTAMP;
    
    -- When status is changed from Concluído to any other status
    ELSEIF OLD.status = 3 AND NEW.status != 3 THEN
        SET NEW.data_conclusao = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `status`
--

CREATE TABLE `status` (
  `id` int(11) NOT NULL,
  `descricao` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `status`
--

INSERT INTO `status` (`id`, `descricao`) VALUES
(1, 'Pendente'),
(2, 'Em Andamento'),
(3, 'Concluído');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `ativo` varchar(1) DEFAULT 'S',
  `data_criacao` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `senha`, `nome`, `ativo`, `data_criacao`) VALUES
(1, 'victor.sangali12@gmail.com', '1234', 'Victor Sangali', 'S', '2025-02-06 23:58:48'),
(2, 'aleatorialeadealeatorio@gmail.com', 'nMgHRj7yx98Dinw', 'Pedro ', 'S', '2025-02-07 16:18:11'),
(3, 'pedroarthurbds13@gmail.com', '1234', 'Pedro ', 'S', '2025-02-13 12:56:12');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `chamados`
--
ALTER TABLE `chamados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_status_chamado` (`status`);

--
-- Índices de tabela `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `chamados`
--
ALTER TABLE `chamados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `status`
--
ALTER TABLE `status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `chamados`
--
ALTER TABLE `chamados`
  ADD CONSTRAINT `fk_status_chamado` FOREIGN KEY (`status`) REFERENCES `status` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
