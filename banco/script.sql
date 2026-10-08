CREATE Schema dbo;
GO

CREATE TABLE dbo.Usuario (
  Id INT IDENTITY PRIMARY KEY,
  Cpf CHAR(11) NOT NULL UNIQUE,
  Nome VARCHAR(100) NOT NULL,
  DataNascimento DATE NOT NULL,
  Celular VARCHAR(15),
  Email VARCHAR(100) NOT NULL,
  Login VARCHAR(30) NOT NULL UNIQUE,
  SenhaHash VARCHAR(100) NOT NULL,
  DataCadastro DATETIME NOT NULL DEFAULT GETDATE(),
  DataUltimoAcesso DATETIME NULL
);
-- lab e sala ficam na mesma tabela, o Tipo separa
CREATE TABLE dbo.Recurso (
  Id INT IDENTITY PRIMARY KEY,
  Codigo VARCHAR(20) NOT NULL UNIQUE,
  Nome VARCHAR(100) NOT NULL,
  Capacidade INT NOT NULL,
  Localizacao VARCHAR(100),
  Tipo CHAR(1) NOT NULL CHECK (Tipo IN ('L','S'))  -- L = Laboratório, S = Sala
);
CREATE TABLE dbo.Status (
  Id INT IDENTITY PRIMARY KEY,
  Descricao VARCHAR(30) NOT NULL UNIQUE
);
INSERT INTO Status (Descricao) VALUES ('Livre'),('Ocupado'),('Bloqueado'),('Reservado');
-- vai ser usada no login (entrega 3)
CREATE TABLE dbo.LogAcesso (
  Id INT IDENTITY PRIMARY KEY,
  UsuarioId INT NOT NULL REFERENCES Usuario(Id),
  DataAcesso DATETIME NOT NULL DEFAULT GETDATE()
);
