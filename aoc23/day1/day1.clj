
;; (println *command-line-args*) 

;;debugging parts of expressions
(defmacro dbg[x] `(let [x# ~x] (println "dbg:" '~x "=" (type x#)) x#))

(defn isDigit [c] (<= (int \0) (int c) (int \9)))

(defn findFirstDigit
    ([] \0)
    ([x & xs] (if (isDigit x) x (apply findFirstDigit xs))))

(defn parseStringList [ln]
  (str
    (apply findFirstDigit ln)
    (apply findFirstDigit (reverse ln))))

(defn convertSequenceOfStringToSequenceStringNumber [lns]
    (map parseStringList lns))

(defn convertSequenceOfStringsNumberToInt [ss]
    (map #(Integer/parseInt %) ss))

(defn sumNumbersInSequence [ss]
    (apply + ss))

(defn readlines []
    (line-seq (java.io.BufferedReader. *in*)))

(println (-> (readlines)
                (convertSequenceOfStringToSequenceStringNumber)
                (convertSequenceOfStringsNumberToInt)
                (sumNumbersInSequence)
))