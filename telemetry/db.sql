
# create database telemetry;

# use telemetry;

create table if not exists logs (
  id int not null auto_increment,
  ts timestamp DEFAULT CURRENT_TIMESTAMP,
  os_version varchar(512) not null,
  os_ts timestamp not null,
  fresh_install boolean not null, 
  entry_type enum('poll', 'error') not null,
  current_version varchar(64) not null,
  prev_version varchar(64) not null,
  new_install boolean not null,
  primary key(id)
  );

