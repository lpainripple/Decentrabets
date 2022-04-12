CREATE DATABASE Decentrabets;

USE Decentrabets;

CREATE TABLE Users (
    user_name       	varchar(40),
    pass       			varchar(250) NOT NULL,
    email				varchar(100),
    account_address 	varchar(100),
    balance   			NUMERIC (15, 8),
    PRIMARY KEY (user_name)
    ) ;
    
INSERT INTO Users (user_name, pass, account_address, balance)
VALUES ('Tiago', 'asdf', '1029394', 52344.12345678),
		('Luis', 'asdf', 'aslkdjghlaksdjgh', 123.123),
		('Anderson', 'asdf', 'oqwiueyroiwqueaskjdhflkasjdhfxzlxcjhvljkxcvxz', 54321.544321),
        ('Alex', 'asdf', '123', 1.1),
		('Marcel', 'asdf', '1', 0);

Select * from Users;

