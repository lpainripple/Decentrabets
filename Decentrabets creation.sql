CREATE DATABASE Decentrabets;

USE Decentrabets;

CREATE TABLE Users (
    user_name       	varchar(40) CONSTRAINT firstkey PRIMARY KEY,
    pass       			varchar(250) NOT NULL,
    address				varchar(100),
    classicAddress 		varchar(100),
    privateKey			varchar(100),
    publicKey			varchar(100),
    seed				varchar(100),
    email 				varchar(100),
    balance   			NUMERIC (15, 6)
    );
   
    
INSERT INTO Users (user_name, pass, address, balance)
VALUES ('Tiago', 'asdf', '1029394', 52344.12345678),
		('Luis', 'asdf', 'aslkdjghlaksdjgh', 123.123),
		('Anderson', 'asdf', 'oqwiueyroiwqueaskjdhflkasjdhfxzlxcjhvljkxcvxz', 54321.544321),
        ('Alex', 'asdf', '123', 1.1),
		('Marcel', 'asdf', '1', 0);
	

select * from USERS
--delete from users where user_name = 'test'


----------------------------------------------------------------------------------------------------------------------

CREATE TABLE Games (
    game_id        		SERIAL PRIMARY KEY,
    championship       	varchar(40) not null,
    category         	varchar(40),
    game_title   		varchar(40),
    team1        		varchar(40) not null,
    team2         		varchar(40) not null,
    begin_datetime   	timestamp,
    end_datetime        timestamp,
    status         		varchar(40),
    winning_team		varchar (40)
);

insert into Games (championship, category, game_title, team1, team2, begin_datetime, end_datetime, status, winning_team)
values ('champions league', 'soccer', 'Semifinal - Chelsea vs Real Madrid', 'Chelsea', 'Real Madrid', current_timestamp, current_timestamp  + interval '3 hours', 'ongoing', null)
	,('champions league', 'soccer', 'Semifinal - Bayern vs Liverpool', 'Bayern', 'Liverpool', current_timestamp - interval '3 hours', current_timestamp, 'finished', 'Bayern')

select * from games

----------------------------------------------------------------------------------------------------------------------

CREATE TABLE Transactions (
    transaction_id      		SERIAL PRIMARY KEY,
    user_name       			varchar(40) NOT NULL,
    blockchain_transaction_id 	varchar(255),
    xrp_amount					NUMERIC (15, 6),
    transaction_datetime		timestamp,
    CONSTRAINT fk_username
      FOREIGN KEY(user_name) 
	  REFERENCES Users(user_name)
    );
   
insert into Transactions (user_name, blockchain_transaction_id, xrp_amount, transaction_datetime)
values ('Luis', 'sadfasdfsdfasdfasdfasdfasdfasdfasdf', '10', current_timestamp)

select * from transactions


----------------------------------------------------------------------------------------------------------------------

CREATE TABLE Bets (
    bet_id			      		SERIAL PRIMARY KEY,
    bet_initiator      			varchar(40) NOT NULL,
    bet_taker				 	varchar(40),
    game_id						int not NULL,
    bet_initiator_team_pick		varchar(40),
    xrp_amount					NUMERIC (15, 6),
    expiration_date				timestamp,
    bet_status					varchar(40),
    bet_multiplication			NUMERIC (10,4),
    CONSTRAINT fk_bet_initiator
      FOREIGN KEY(bet_initiator) 
	  REFERENCES Users(user_name),
	CONSTRAINT fk_bet_taker
      FOREIGN KEY(bet_taker) 
	  REFERENCES Users(user_name),
	CONSTRAINT fk_game_id
      FOREIGN KEY(game_id) 
	  REFERENCES Games(game_id)
    );
    
insert into bets (bet_initiator, bet_taker, game_id, bet_initiator_team_pick, xrp_amount, expiration_date, bet_status, bet_multiplication)
values ('Luis', 'Marcel', 2, 'Chelsea', 20,  current_timestamp - interval '3 days', 'active', 1)
,		('Luis', null, 2, 'Chelsea', 30,  current_timestamp - interval '3 days', 'active', 1)


select * from bets
