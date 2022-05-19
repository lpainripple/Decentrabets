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
    game_external_id    varchar(40) not null,
    home_team_id        varchar(40) not null,
	home_team_name      varchar(40) not null,
	away_team_id        varchar(40) not null,
	away_team_name      varchar(40) not null,
	season_name       	varchar(40) not null,
    category         	varchar(40),
    score_home          NUMERIC(4),
	score_home_pen_goals NUMERIC(4),
	score_away          NUMERIC(4),
	score_away_pen_goals NUMERIC(4),
	begin_datetime   	timestamp,
    status         		varchar(40)
);

insert into Games (game_external_id, home_team_id, home_team_name, away_team_id, away_team_name, season_name, category, score_home, score_home_pen_goals, score_away, score_away_pen_goals, begin_datetime, status)
values ('243652', '1400', 'Man City', '102', 'Villareal', 'UEFA Champions League - 2021/2022', 'soccer', 0, 0, 0, 0, '2022-04-13 19:00', 'not started')

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
,		('tiago', null, 3, 'Man City', 99, null,  'active', 2)


select * from bets

--------------------------------------------------------------------------------------------------------------------------------
CREATE function delete_bet_id(id int)
RETURNS varchar AS
$$
BEGIN
  IF (select count(bet_id) from bets where bet_id = id and bet_taker is null) > 0 then
  	delete from bets where bet_id = id;
  	RETURN concat('Bet with id: ',id, ' deleted') ;
  ELSE
  	return 'Bet not found or already commited';
  END IF;
END;
$$ LANGUAGE plpgsql;
--------------------------------------------------------------------------------------------------------------------------------
CREATE function get_bets_before_date(initiator varchar, taker varchar, game_time date)
returns TABLE(bet_id int, bet_initiator varchar, bet_taker varchar, game_id int, bet_initiator_team_pick varchar, xrp_amount NUMERIC (15, 6), bet_status varchar, bet_multiplication NUMERIC (10,4), game_title varchar, game_status varchar) as
$$
  	select bets.bet_id, bets.bet_initiator, bets.bet_taker, bets.game_id, bets.bet_initiator_team_pick, bets.xrp_amount, bets. bet_status, bets.bet_multiplication, concat(home_team_name,' vs ',away_team_name) as game_title, games.status 
	from bets 
	inner join games on bets.game_id = games.game_id
	where coalesce (bets.bet_initiator, 'null') = coalesce(COALESCE(initiator,bets.bet_initiator),'null')
	and coalesce(bets.bet_taker, 'null') = coalesce(COALESCE(taker,bets.bet_taker), 'null')
	and coalesce(games.begin_datetime,current_timestamp ) <= coalesce(COALESCE(game_time, games.begin_datetime),current_timestamp )

$$ LANGUAGE sql;

CREATE function get_bets_after_date(initiator varchar, taker varchar, game_time date)
returns TABLE(bet_id int, bet_initiator varchar, bet_taker varchar, game_id int, bet_initiator_team_pick varchar, xrp_amount NUMERIC (15, 6), bet_status varchar, bet_multiplication NUMERIC (10,4), game_title varchar, game_status varchar) as
$$
  	select bets.bet_id, bets.bet_initiator, bets.bet_taker, bets.game_id, bets.bet_initiator_team_pick, bets.xrp_amount, bets. bet_status, bets.bet_multiplication, concat(home_team_name,' vs ',away_team_name) as game_title, games.status 
	from bets 
	inner join games on bets.game_id = games.game_id
	where coalesce (bets.bet_initiator, 'null') = coalesce(COALESCE(initiator,bets.bet_initiator),'null')
	and coalesce(bets.bet_taker, 'null') = coalesce(COALESCE(taker,bets.bet_taker), 'null')
	and coalesce(games.begin_datetime,current_timestamp ) >= coalesce(COALESCE(game_time, games.begin_datetime),current_timestamp )

$$ LANGUAGE sql;

select *
from get_bets_after_date('tiago', 'anderson', CURRENT_DATE)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
