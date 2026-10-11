USE dbo;
GO
CREATE TABLE Reserva (
  Id INT IDENTITY PRIMARY KEY,
  RecursoId INT NOT NULL REFERENCES Recurso(Id),
  UsuarioId INT NOT NULL REFERENCES Usuario(Id),
  StatusId INT NOT NULL REFERENCES Status(Id),
  DataInicial DATE NOT NULL,
  DataFinal DATE NOT NULL,
  HoraInicial TIME(0) NOT NULL,
  HoraFinal TIME(0) NOT NULL,
  DataCadastro DATETIME NOT NULL DEFAULT GETDATE(),
  CHECK (DataFinal >= DataInicial),
  CHECK (HoraFinal > HoraInicial)
);
CREATE INDEX IX_Reserva_Recurso ON Reserva(RecursoId, DataInicial, DataFinal);
