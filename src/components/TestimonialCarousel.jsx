import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonials } from '../data/testimonials';
import { Button } from './ui/button';

const TestimonialCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        return () => emblaApi.off('select', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4"
                        >
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 h-full hover:border-blue-500 transition-all duration-300">
                                {/* Quote Icon */}
                                <Quote className="h-10 w-10 text-blue-400 mb-4 opacity-50" />

                                {/* Rating */}
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-gray-300 text-lg mb-6 leading-relaxed italic">
                                    "{testimonial.quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-white font-bold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{testimonial.name}</div>
                                        <div className="text-sm text-gray-400">
                                            {testimonial.role}, {testimonial.company}
                                        </div>
                                    </div>
                                </div>

                                {/* Project Type Badge */}
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    <span className="text-xs text-blue-400 font-medium">
                                        {testimonial.projectType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    className="border-slate-700 text-white hover:bg-slate-800"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                {/* Dots */}
                <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 rounded-full transition-all ${index === selectedIndex
                                    ? 'w-8 bg-blue-500'
                                    : 'w-2 bg-slate-600 hover:bg-slate-500'
                                }`}
                            onClick={() => emblaApi?.scrollTo(index)}
                        />
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    className="border-slate-700 text-white hover:bg-slate-800"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default TestimonialCarousel;
