FROM mysql:latest 

  

# Set environment variables 

ENV MYSQL_DATABASE=node_db \ 

    MYSQL_ROOT_PASSWORD=Chidhagni123 

  

# Configure MySQL to ignore case sensitivity for table names 

RUN echo "[mysqld]\n\ 

lower_case_table_names=1\n\ 

bind-address=0.0.0.0" > /etc/mysql/conf.d/custom.cnf 

  

# Add the initial database schema SQL script to the Docker image 

ADD Dump20250501.sql /docker-entrypoint-initdb.d/ 
