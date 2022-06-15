local tobit, band=bit.tobit, bit.band 
args={...} 
local num=tonumber(args[1]) or 100 
for i=1,num do 
	if band(tobit(i),tobit(i-1))==0  then  
		print(i, "power of 2") 
	end 
end 
