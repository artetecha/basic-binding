create type ratio as enum (
	'LANDSCAPE',
	'PORTRAIT',
	'SQUARE'
);

create type "type" as enum (
	'AUDIO',
	'DOCUMENT',
	'IMAGE',
	'VIDEO'
);

create table author (
	id serial primary key,
	first_name text,
	last_name text
);

create table media (
	id serial primary key,
	title text,
	description text,
	caption text,
	uri text,
	author_id integer,
	ratio ratio,
	"type" type,
	constraint media_author foreign key (author_id) references public.author (id)
);
