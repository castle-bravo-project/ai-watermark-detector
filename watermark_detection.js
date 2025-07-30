// Real watermark detection algorithms

class RealWatermarkDetector {
    constructor() {
        this.suspiciousPatterns = {
            // Known AI model quirks
            repetitiveStructures: [
                /^(Furthermore|Moreover|Additionally|In addition),?\s/gim,
                /\b(it is important to note|it should be noted)\b/gim,
                /\b(in conclusion|to summarize|in summary)\b/gim
            ],
            // Unnatural word combinations
            aiPhrases: [
                /\bas an AI\b/gim,
                /\bI don't have personal\b/gim,
                /\bI cannot browse\b/gim,
                /\bI'm not able to\b/gim
            ]
        };
    }

    // 1. Statistical Entropy Analysis
    calculateTextEntropy(text) {
        const words = text.toLowerCase().match(/\w+/g) || [];
        const wordCount = {};
        
        // Count word frequencies
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        const totalWords = words.length;
        let entropy = 0;
        
        // Calculate Shannon entropy
        Object.values(wordCount).forEach(count => {
            const probability = count / totalWords;
            entropy -= probability * Math.log2(probability);
        });
        
        return {
            entropy: entropy,
            uniqueWords: Object.keys(wordCount).length,
            repetitionRatio: 1 - (Object.keys(wordCount).length / totalWords),
            avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length
        };
    }

    // 2. Sentence Structure Analysis
    analyzeSentenceStructure(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const structures = sentences.map(sentence => {
            const words = sentence.trim().split(/\s+/);
            return {
                length: words.length,
                startsWithCapital: /^[A-Z]/.test(sentence.trim()),
                hasCommas: (sentence.match(/,/g) || []).length,
                complexity: this.calculateSentenceComplexity(sentence)
            };
        });
        
        // Detect repetitive patterns
        const lengthVariance = this.calculateVariance(structures.map(s => s.length));
        const avgComplexity = structures.reduce((sum, s) => sum + s.complexity, 0) / structures.length;
        
        return {
            sentenceCount: sentences.length,
            avgSentenceLength: structures.reduce((sum, s) => sum + s.length, 0) / structures.length,
            lengthVariance: lengthVariance,
            avgComplexity: avgComplexity,
            uniformityScore: this.calculateUniformityScore(structures)
        };
    }

    calculateSentenceComplexity(sentence) {
        const subordinatingConjunctions = ['because', 'although', 'since', 'while', 'whereas'];
        const coordinatingConjunctions = ['and', 'but', 'or', 'nor', 'for', 'yet', 'so'];
        
        let complexity = 1;
        const lowerSentence = sentence.toLowerCase();
        
        subordinatingConjunctions.forEach(conj => {
            complexity += (lowerSentence.match(new RegExp(`\\b${conj}\\b`, 'g')) || []).length * 2;
        });
        
        coordinatingConjunctions.forEach(conj => {
            complexity += (lowerSentence.match(new RegExp(`\\b${conj}\\b`, 'g')) || []).length;
        });
        
        return complexity;
    }

    // 3. Vocabulary Analysis
    analyzeVocabulary(text) {
        const words = text.toLowerCase().match(/\w+/g) || [];
        const wordFreq = {};
        
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        // Common vs rare word analysis
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
        
        const uncommonWords = Object.keys(wordFreq).filter(word => 
            !commonWords.has(word) && word.length > 6
        );
        
        return {
            totalWords: words.length,
            uniqueWords: Object.keys(wordFreq).length,
            lexicalDiversity: Object.keys(wordFreq).length / words.length,
            uncommonWordRatio: uncommonWords.length / Object.keys(wordFreq).length,
            avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length
        };
    }

    // 4. Pattern Matching for Known AI Signatures
    detectAIPatterns(text) {
        let suspiciousCount = 0;
        const foundPatterns = [];
        
        // Check for repetitive sentence starters
        Object.entries(this.suspiciousPatterns).forEach(([category, patterns]) => {
            patterns.forEach(pattern => {
                const matches = text.match(pattern) || [];
                if (matches.length > 0) {
                    suspiciousCount += matches.length;
                    foundPatterns.push({
                        category: category,
                        pattern: pattern.source,
                        matches: matches.length
                    });
                }
            });
        });
        
        return {
            suspiciousPatternCount: suspiciousCount,
            foundPatterns: foundPatterns,
            patternDensity: suspiciousCount / (text.split(/\s+/).length / 100) // per 100 words
        };
    }

    // 5. Perplexity Estimation (simplified)
    estimatePerplexity(text) {
        const words = text.toLowerCase().match(/\w+/g) || [];
        const bigrams = [];
        
        for (let i = 0; i < words.length - 1; i++) {
            bigrams.push(`${words[i]} ${words[i + 1]}`);
        }
        
        const bigramFreq = {};
        bigrams.forEach(bigram => {
            bigramFreq[bigram] = (bigramFreq[bigram] || 0) + 1;
        });
        
        // Simplified perplexity calculation
        let logProbSum = 0;
        Object.values(bigramFreq).forEach(freq => {
            const prob = freq / bigrams.length;
            logProbSum += Math.log2(prob);
        });
        
        const avgLogProb = logProbSum / bigrams.length;
        const perplexity = Math.pow(2, -avgLogProb);
        
        return {
            perplexity: perplexity,
            uniqueBigrams: Object.keys(bigramFreq).length,
            bigramRepetition: 1 - (Object.keys(bigramFreq).length / bigrams.length)
        };
    }

    // Main analysis function
    analyzeContent(text) {
        if (!text || text.trim().length < 50) {
            return { error: "Text too short for meaningful analysis" };
        }

        const entropy = this.calculateTextEntropy(text);
        const structure = this.analyzeSentenceStructure(text);
        const vocabulary = this.analyzeVocabulary(text);
        const patterns = this.detectAIPatterns(text);
        const perplexity = this.estimatePerplexity(text);

        // Scoring algorithm
        const scores = this.calculateWatermarkScores({
            entropy,
            structure,
            vocabulary,
            patterns,
            perplexity
        });

        return {
            timestamp: new Date().toISOString(),
            contentLength: text.length,
            analysis: {
                entropy,
                structure,
                vocabulary,
                patterns,
                perplexity
            },
            scores,
            overallConfidence: scores.overallScore,
            isAIGenerated: scores.overallScore > 0.6
        };
    }

    calculateWatermarkScores(analysis) {
        const { entropy, structure, vocabulary, patterns, perplexity } = analysis;
        
        // Entropy scoring (lower entropy = more AI-like)
        const entropyScore = Math.max(0, (12 - entropy.entropy) / 12);
        
        // Structure uniformity (high uniformity = more AI-like)
        const structureScore = Math.min(1, structure.uniformityScore);
        
        // Vocabulary diversity (low diversity = more AI-like)
        const vocabScore = Math.max(0, (0.8 - vocabulary.lexicalDiversity) / 0.8);
        
        // Pattern detection (more patterns = more AI-like)
        const patternScore = Math.min(1, patterns.patternDensity / 5);
        
        // Perplexity (very low or very high = suspicious)
        const perplexityScore = perplexity.perplexity < 10 || perplexity.perplexity > 1000 ? 0.8 : 0.2;
        
        // Weighted combination
        const weights = {
            entropy: 0.25,
            structure: 0.20,
            vocabulary: 0.25,
            patterns: 0.20,
            perplexity: 0.10
        };
        
        const overallScore = 
            entropyScore * weights.entropy +
            structureScore * weights.structure +
            vocabScore * weights.vocabulary +
            patternScore * weights.patterns +
            perplexityScore * weights.perplexity;
            
        return {
            entropyScore,
            structureScore,
            vocabScore,
            patternScore,
            perplexityScore,
            overallScore: Math.min(1, Math.max(0, overallScore))
        };
    }

    // Utility functions
    calculateVariance(numbers) {
        const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
    }

    calculateUniformityScore(structures) {
        const lengths = structures.map(s => s.length);
        const complexities = structures.map(s => s.complexity);
        
        const lengthVariance = this.calculateVariance(lengths);
        const complexityVariance = this.calculateVariance(complexities);
        
        // Higher variance = more human-like, lower uniformity score
        return Math.max(0, 1 - (lengthVariance / 50) - (complexityVariance / 10));
    }
}

// Usage example:
/*
const detector = new RealWatermarkDetector();
const result = detector.analyzeContent("Your text content here...");
console.log(result);
*/